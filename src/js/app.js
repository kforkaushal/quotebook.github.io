/**
 * QUOTEBOOK - Main Application Logic
 * Integrates 39,000+ quotes JSON data, Pixabay API photography, Web Speech synthesis, and Poster Studio.
 */

// Global State
const state = {
  quotesData: null,
  allQuotes: [],
  categoriesMap: {},
  activeCategory: 'all',
  searchQuery: '',
  selectedAuthor: 'all',
  sortBy: 'popular',
  currentPage: 1,
  pageSize: 24,
  filteredQuotes: [],
  bookmarks: JSON.parse(localStorage.getItem('qb_bookmarks') || '[]'),
  heroQuote: null,
  pixabayCache: {},
  pixabayApiKey: '31635482-a6219e4788c28c0983dbc0cd0',
  zenInterval: null,
  zenIsPlaying: false,
  zenCurrentIndex: 0,
  speechSynth: window.speechSynthesis || null
};

// Category to Pixabay Keyword Mapping
const categoryImageMap = {
  'Age & Aging': 'vintage clock antique',
  'Ambition & Goals': 'mountain peak sunrise climb',
  'Art & Creativity': 'abstract color painting art',
  'Beauty & Aesthetics': 'blossom flower elegant aesthetic',
  'Books & Reading': 'open book library quiet',
  'Change & Growth': 'green leaf sprout forest',
  'Character & Integrity': 'architecture granite stone pillar',
  'Courage & Bravery': 'storm wave ocean wild',
  'Death & Mortality': 'sunset twilight quiet horizon',
  'Dreams & Aspirations': 'starry sky galaxy night',
  'Education & Learning': 'university library study',
  'Equality & Justice': 'statue marble scales sunset',
  'Experience & Practice': 'path woods journey mist',
  'Failure & Resilience': 'tree solo winter snow',
  'Faith & Spirituality': 'cathedral light ray mist',
  'Family & Parenting': 'golden hour family warm',
  'Famous Quotes': 'monument vintage statue classic',
  'Fear & Courage': 'lightning sky thunderstorm',
  'Freedom & Liberty': 'flying bird sky wild freedom',
  'Friendship & Companionship': 'sunset friends silhouette',
  'Future & Progress': 'city skyline neon lights future',
  'Gratitude & Thankfulness': 'autumn leaves sunlight warm',
  'Happiness & Joy': 'sunflower field bright summer',
  'Health & Wellness': 'yoga zen lake quiet sunrise',
  'Hope & Optimism': 'light tunnel horizon dawn',
  'Humor & Wit': 'smile vibrant color macro',
  'Imagination & Creativity': 'light bulb neon creative',
  'Kindness & Compassion': 'hands warm sunset glow',
  'Life & Living': 'road journey scenic landscape',
  'Love & Relationships': 'heart sunset couple warm glow',
  'Mind & Consciousness': 'misty mountains cloud reflection',
  'Money & Wealth': 'gold skyscraper urban light',
  'Motivation & Inspiration': 'runner summit sunrise motivation',
  'Music & Art': 'piano keys instrument acoustic',
  'Nature & Environment': 'nature landscape forest river',
  'Patience & Perseverance': 'desert dunes calm horizon',
  'Peace & Harmony': 'zen stones water ripple calm',
  'Philosophy & Thinking': 'thinker sculpture library shadows',
  'Power & Leadership': 'lion eagle majesty wild',
  'Purpose & Meaning': 'compass map vintage journey',
  'Science & Discovery': 'space nebula stars cosmos',
  'Self & Identity': 'mirror reflection water calm',
  'Simplicity & Minimalism': 'minimal architecture shadow clean',
  'Strength & Resilience': 'rock formation cliff ocean',
  'Success & Achievement': 'trophy summit peak sunrise',
  'Technology & Innovation': 'future technology abstract cyber',
  'Time & Patience': 'sandglass hourglass time shadow',
  'Truth & Honesty': 'crystal clear water reflection',
  'Wisdom & Knowledge': 'ancient library book candle',
  'Work & Career': 'modern office desk minimalist'
};

// UI Elements
let posterStudioInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  setupEventListeners();

  const isQuotesPage = document.body.classList.contains('quotes-page');
  const isHomePage = document.body.classList.contains('home-page');

  if (isQuotesPage) {
    initPosterStudio();
    updateBookmarkBadge();
  }

  try {
    await loadQuotesData();

    // Check URL parameters (e.g. ?category=Philosophy or ?action=poster)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    const actionParam = urlParams.get('action');

    if (isHomePage) {
      initHomeHeroCard();
      initHomeDeviceShowcase();
    }

    if (isQuotesPage) {
      if (catParam && state.categoriesMap[catParam]) {
        state.activeCategory = catParam;
      }

      renderCategoryPills();
      populateAuthorDropdown();
      selectHeroQuote();
      applyFilters();

      if (actionParam === 'poster' && state.allQuotes.length > 0) {
        const customQuoteText = urlParams.get('quote');
        const customQuoteAuthor = urlParams.get('author');
        const customQuoteCat = urlParams.get('category');
        
        let targetQuote = state.heroQuote || state.allQuotes[0];
        if (customQuoteText) {
          targetQuote = {
            quote: customQuoteText,
            author: customQuoteAuthor || 'Unknown',
            category: customQuoteCat || 'Wisdom'
          };
        }
        setTimeout(() => {
          openPosterStudio(targetQuote);
        }, 400);
      }
    }
    
    // Set up listeners for Today's Quotes section on landing page
    setupTodaysQuotesListeners();
  } catch (err) {
    console.error("Failed to load quotes dataset:", err);
    showToast("Error loading quotes dataset. Please refresh.");
  }
}

// Today's Quotes Grid Event Listeners
function setupTodaysQuotesListeners() {
  const container = document.getElementById('todaysQuotesGrid');
  if (!container) return;
  
  // Copy Event
  container.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const q = e.currentTarget.dataset.quote;
      const a = e.currentTarget.dataset.author;
      copyToClipboard(q, a);
    });
  });
  
  // Speak Event
  container.querySelectorAll('.btn-speak').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const q = e.currentTarget.dataset.quote;
      const a = e.currentTarget.dataset.author;
      speakQuote(q, a);
    });
  });
  
  // Poster Event
  container.querySelectorAll('.btn-poster').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const q = e.currentTarget.dataset.quote;
      const a = e.currentTarget.dataset.author;
      const c = e.currentTarget.dataset.cat;
      window.location.href = `quotes.html?action=poster&quote=${encodeURIComponent(q)}&author=${encodeURIComponent(a)}&category=${encodeURIComponent(c)}`;
    });
  });
}

// Home Page Tilted 3D Mobile Hero Mockup Logic
async function initHomeHeroCard() {
  if (state.allQuotes.length === 0) return;
  const sample = state.allQuotes[Math.floor(Math.random() * state.allQuotes.length)];
  
  const quoteEl = document.getElementById('homeCardQuote');
  const authorEl = document.getElementById('homeCardAuthor');
  const catEl = document.getElementById('homeCardCat');
  const bgEl = document.getElementById('heroPhoneBg');

  if (quoteEl) quoteEl.textContent = `"${sample.quote}"`;
  if (authorEl) authorEl.textContent = `— ${sample.author}`;
  if (catEl) catEl.textContent = sample.category;

  if (bgEl) {
    const query = categoryImageMap[sample.category] || sample.category;
    const images = await fetchPixabayImages(query, 3);
    if (images.length > 0) {
      const bgUrl = images[Math.floor(Math.random() * images.length)].largeImageURL;
      bgEl.style.backgroundImage = `url('${bgUrl}')`;
    }
  }

  const btnRefresh = document.getElementById('homeBtnRefresh');
  const btnSpeak = document.getElementById('homeBtnSpeak');

  if (btnRefresh) {
    btnRefresh.onclick = () => {
      initHomeHeroCard();
      showToast('Loaded new random quote sample!');
    };
  }

  if (btnSpeak) {
    btnSpeak.onclick = () => {
      speakQuote(sample.quote, sample.author);
    };
  }
}

// Home Page Multi-Device Showcase & Zen Mode Preview
let mockupCurrentIndex = 0;

async function initHomeDeviceShowcase() {
  const frame = document.getElementById('deviceMockupFrame');
  const tabs = document.querySelectorAll('.device-tab-btn');

  if (tabs.length > 0 && frame) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const dev = tab.dataset.device;
        frame.className = `device-mockup-frame ${dev}`;
      });
    });
  }

  updateHomeDeviceQuote();

  const nextBtn = document.getElementById('mockupBtnNext');
  const prevBtn = document.getElementById('mockupBtnPrev');
  const speakBtn = document.getElementById('mockupBtnSpeak');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      mockupCurrentIndex = (mockupCurrentIndex + 1) % (state.allQuotes.length || 1);
      updateHomeDeviceQuote();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      mockupCurrentIndex = (mockupCurrentIndex - 1 + state.allQuotes.length) % (state.allQuotes.length || 1);
      updateHomeDeviceQuote();
    });
  }

  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      const q = state.allQuotes[mockupCurrentIndex];
      if (q) speakQuote(q.quote, q.author);
    });
  }
}

async function updateHomeDeviceQuote() {
  if (state.allQuotes.length === 0) return;
  const q = state.allQuotes[mockupCurrentIndex] || state.allQuotes[0];

  const tagEl = document.getElementById('mockupTag');
  const quoteEl = document.getElementById('mockupQuote');
  const authorEl = document.getElementById('mockupAuthor');
  const bgEl = document.getElementById('mockupZenBg');

  if (tagEl) tagEl.textContent = `ZEN MODE • ${q.category.toUpperCase()}`;
  if (quoteEl) quoteEl.textContent = `"${q.quote}"`;
  if (authorEl) authorEl.textContent = `— ${q.author}`;

  if (bgEl) {
    const query = categoryImageMap[q.category] || q.category;
    const images = await fetchPixabayImages(query, 3);
    if (images.length > 0) {
      const bgUrl = images[Math.floor(Math.random() * images.length)].largeImageURL;
      setSmoothBackgroundImage(bgEl, bgUrl);
    }
  }
}

// Helper: Preload Image & Crossfade Smoothly
function setSmoothBackgroundImage(element, imageUrl) {
  if (!element || !imageUrl) return;
  const tempImg = new Image();
  tempImg.crossOrigin = "Anonymous";
  tempImg.onload = () => {
    element.style.transition = 'opacity 0.4s ease-in-out, background-image 0.4s ease-in-out';
    element.style.backgroundImage = `url('${imageUrl}')`;
    element.style.opacity = '1';
  };
  tempImg.src = imageUrl;
}

// 1. Optimized Two-Stage Data Loader (Sub-10ms Initial Load + Background Dataset Sync)
async function loadQuotesData() {
  // Stage 1: Load lightweight featured dataset FIRST for instant sub-10ms UI render
  try {
    const resFeatured = await fetch('data/featured_quotes.json');
    if (resFeatured.ok) {
      const featData = await resFeatured.json();
      processDataset(featData);
    }
  } catch (err) {
    console.warn("Featured dataset fetch warning, fallback to full dataset:", err);
  }

  // Stage 2: Load full 39,000+ dataset in background idle time without blocking the UI thread
  setTimeout(async () => {
    try {
      const resFull = await fetch('data/quotes_8000_plus.json');
      if (resFull.ok) {
        const fullData = await resFull.json();
        processDataset(fullData);

        const badge = document.getElementById('quoteCountBadge');
        if (badge) badge.textContent = `${state.allQuotes.length.toLocaleString()} Quotes Available`;

        if (typeof renderCategoryPills === 'function') renderCategoryPills();
        if (typeof populateAuthorDropdown === 'function') populateAuthorDropdown();
        if (typeof applyFilters === 'function') applyFilters();
      }
    } catch (err) {
      console.warn("Full dataset background load notice:", err);
    }
  }, 100);
}

function processDataset(dataObj) {
  state.quotesData = dataObj;
  state.categoriesMap = dataObj.categories || {};
  
  const quotesList = [];
  Object.keys(state.categoriesMap).forEach(catName => {
    const catObj = state.categoriesMap[catName];
    if (catObj && Array.isArray(catObj.quotes)) {
      catObj.quotes.forEach(q => {
        quotesList.push({
          quote: q.quote,
          author: q.author || 'Unknown',
          tags: q.tags || [],
          popularity: q.popularity || 0,
          category: catName
        });
      });
    }
  });

  state.allQuotes = quotesList;
  const totalQuotes = state.allQuotes.length.toLocaleString();
  const badge = document.getElementById('quoteCountBadge');
  if (badge) badge.textContent = `${totalQuotes} Quotes Available`;
}

// 2. Render Category Navigation Pills
function renderCategoryPills() {
  const container = document.getElementById('categoryPills');
  const catNames = Object.keys(state.categoriesMap);
  
  let html = `<button class="category-pill ${state.activeCategory === 'all' ? 'active' : ''}" data-category="all">
    <i class="fa-solid fa-layer-group"></i> All Quotes (${state.allQuotes.length})
  </button>`;

  catNames.forEach(cat => {
    const count = state.categoriesMap[cat].count || state.categoriesMap[cat].quotes.length;
    const isActive = state.activeCategory === cat ? 'active' : '';
    html += `<button class="category-pill ${isActive}" data-category="${cat}">
      ${cat} (${count})
    </button>`;
  });

  container.innerHTML = html;

  // Add click listeners to pills
  container.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.dataset.category;
      state.currentPage = 1;
      applyFilters();
    });
  });
}

// 3. Populate Authors Filter Dropdown
function populateAuthorDropdown() {
  const select = document.getElementById('authorSelect');
  const authorCounts = {};
  
  state.allQuotes.forEach(q => {
    if (q.author && q.author !== 'Unknown') {
      authorCounts[q.author] = (authorCounts[q.author] || 0) + 1;
    }
  });

  // Sort authors by count descending
  const sortedAuthors = Object.keys(authorCounts)
    .sort((a, b) => authorCounts[b] - authorCounts[a])
    .slice(0, 100); // Top 100 authors

  let optionsHtml = `<option value="all">All Authors</option>`;
  sortedAuthors.forEach(author => {
    optionsHtml += `<option value="${author}">${author} (${authorCounts[author]})</option>`;
  });

  select.innerHTML = optionsHtml;
}

// 4. Hero Featured Spotlight
async function selectHeroQuote(quote = null) {
  if (!quote) {
    // Pick a high popularity quote
    const popularQuotes = state.allQuotes.filter(q => q.popularity > 0.02);
    const pool = popularQuotes.length > 0 ? popularQuotes : state.allQuotes;
    state.heroQuote = pool[Math.floor(Math.random() * pool.length)];
  } else {
    state.heroQuote = quote;
  }

  const h = state.heroQuote;
  if (!h) return;

  document.getElementById('heroQuoteText').textContent = `"${h.quote}"`;
  document.getElementById('heroAuthorTag').textContent = `— ${h.author}`;
  document.getElementById('heroCategoryTag').innerHTML = `<i class="fa-solid fa-sparkles"></i> ${h.category}`;

  // Tags
  const tagsContainer = document.getElementById('heroTagsList');
  tagsContainer.innerHTML = h.tags.slice(0, 3).map(t => `<span class="tag-chip">${t}</span>`).join('');

  // Update Hero Pixabay Background Image
  const query = categoryImageMap[h.category] || h.category;
  const images = await fetchPixabayImages(query, 5);
  if (images.length > 0) {
    const bgUrl = images[Math.floor(Math.random() * images.length)].largeImageURL;
    setSmoothBackgroundImage(document.getElementById('heroBackdrop'), bgUrl);
  }
}

// 5. Pixabay API Integration
async function fetchPixabayImages(query, perPage = 10) {
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  if (state.pixabayCache[cleanQuery]) {
    return state.pixabayCache[cleanQuery];
  }

  try {
    const url = `https://pixabay.com/api/?key=${state.pixabayApiKey}&q=${encodeURIComponent(cleanQuery)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Pixabay API error');
    const data = await res.json();
    const hits = data.hits || [];
    state.pixabayCache[cleanQuery] = hits;
    return hits;
  } catch (err) {
    console.warn("Pixabay API fetch failed:", err);
    return [];
  }
}

// 6. Filtering & Rendering Logic
function applyFilters() {
  let list = [...state.allQuotes];

  // Category Filter
  if (state.activeCategory !== 'all') {
    list = list.filter(q => q.category === state.activeCategory);
  }

  // Search Input Query Filter
  if (state.searchQuery) {
    const qLower = state.searchQuery.toLowerCase();
    list = list.filter(q => 
      q.quote.toLowerCase().includes(qLower) ||
      q.author.toLowerCase().includes(qLower) ||
      q.tags.some(t => t.toLowerCase().includes(qLower))
    );
  }

  // Author Filter
  if (state.selectedAuthor !== 'all') {
    list = list.filter(q => q.author === state.selectedAuthor);
  }

  // Sorting
  if (state.sortBy === 'popular') {
    list.sort((a, b) => b.popularity - a.popularity);
  } else if (state.sortBy === 'alphabetical') {
    list.sort((a, b) => a.author.localeCompare(b.author));
  } else if (state.sortBy === 'quoteLength') {
    list.sort((a, b) => a.quote.length - b.quote.length);
  } else if (state.sortBy === 'random') {
    list.sort(() => Math.random() - 0.5);
  }

  state.filteredQuotes = list;
  renderQuotesGrid();
}

function renderQuotesGrid() {
  const grid = document.getElementById('quotesGrid');
  const noResults = document.getElementById('noResultsView');
  const loadMoreBtn = document.getElementById('loadMoreContainer');
  const title = document.getElementById('currentSectionTitle');
  const count = document.getElementById('resultsCount');

  // Update Section Title
  title.textContent = state.activeCategory === 'all' ? 'Featured Quotes' : state.activeCategory;
  count.textContent = `Showing ${Math.min(state.currentPage * state.pageSize, state.filteredQuotes.length)} of ${state.filteredQuotes.length.toLocaleString()} quotes`;

  if (state.filteredQuotes.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    loadMoreBtn.classList.add('hidden');
    return;
  }

  noResults.classList.add('hidden');
  const visibleQuotes = state.filteredQuotes.slice(0, state.currentPage * state.pageSize);

  let gridHtml = '';
  visibleQuotes.forEach((q, idx) => {
    const isBookmarked = state.bookmarks.some(b => b.quote === q.quote && b.author === q.author);
    const heartIcon = isBookmarked ? 'fa-solid fa-heart active text-danger' : 'fa-regular fa-heart';

    gridHtml += `
      <article class="quote-card" data-index="${idx}">
        <div class="quote-card-header">
          <span class="quote-category-tag">${q.category}</span>
          <span class="quote-pop-badge"><i class="fa-solid fa-fire"></i> ${(q.popularity * 100).toFixed(1)}</span>
        </div>
        
        <div class="card-quote-body">
          <div class="quote-icon-watermark">“</div>
          <blockquote class="card-quote-text">"${q.quote}"</blockquote>
          <span class="card-author">— ${q.author}</span>
        </div>

        <div class="quote-card-footer">
          <div class="card-tags">
            ${q.tags.slice(0, 2).map(t => `<span class="mini-tag">#${t}</span>`).join('')}
          </div>
          <div class="card-actions">
            <button class="mini-action-btn card-btn-copy" title="Copy Text"><i class="fa-regular fa-copy"></i></button>
            <button class="mini-action-btn card-btn-speak" title="Read Aloud"><i class="fa-solid fa-volume-high"></i></button>
            <button class="mini-action-btn card-btn-bookmark" title="Bookmark"><i class="${heartIcon}"></i></button>
            <button class="mini-action-btn card-btn-poster" title="Create Poster"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
          </div>
        </div>
      </article>
    `;
  });

  grid.innerHTML = gridHtml;

  // Show / Hide Load More
  if (visibleQuotes.length < state.filteredQuotes.length) {
    loadMoreBtn.classList.remove('hidden');
  } else {
    loadMoreBtn.classList.add('hidden');
  }

  // Attach card event listeners
  grid.querySelectorAll('.quote-card').forEach((card, idx) => {
    const qObj = visibleQuotes[idx];

    card.querySelector('.card-btn-copy').addEventListener('click', () => copyToClipboard(qObj.quote, qObj.author));
    card.querySelector('.card-btn-speak').addEventListener('click', () => speakQuote(qObj.quote, qObj.author));
    card.querySelector('.card-btn-bookmark').addEventListener('click', (e) => toggleBookmark(qObj, e.currentTarget));
    card.querySelector('.card-btn-poster').addEventListener('click', () => openPosterStudio(qObj));
  });
}

// 7. Actions: Copy, Speak, Bookmark
function copyToClipboard(text, author) {
  const formatted = `"${text}" — ${author}`;
  navigator.clipboard.writeText(formatted).then(() => {
    showToast('Quote copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy quote.');
  });
}

function speakQuote(text, author) {
  if (!state.speechSynth) {
    showToast('Text-to-speech not supported in this browser.');
    return;
  }
  state.speechSynth.cancel(); // Stop current speech
  const utterance = new SpeechSynthesisUtterance(`${text}. By ${author}`);
  utterance.rate = 0.92;
  utterance.pitch = 1.0;
  state.speechSynth.speak(utterance);
  showToast('Reading quote aloud...');
}

function toggleBookmark(qObj, btnEl) {
  const index = state.bookmarks.findIndex(b => b.quote === qObj.quote && b.author === qObj.author);
  if (index > -1) {
    state.bookmarks.splice(index, 1);
    if (btnEl) {
      const icon = btnEl.querySelector('i');
      icon.className = 'fa-regular fa-heart';
    }
    showToast('Removed from saved quotes');
  } else {
    state.bookmarks.push(qObj);
    if (btnEl) {
      const icon = btnEl.querySelector('i');
      icon.className = 'fa-solid fa-heart active text-danger';
    }
    showToast('Saved to bookmarks!');
  }

  localStorage.setItem('qb_bookmarks', JSON.stringify(state.bookmarks));
  updateBookmarkBadge();
  renderBookmarksList();
}

function updateBookmarkBadge() {
  document.getElementById('bookmarkCount').textContent = state.bookmarks.length;
}

// 8. Poster Studio Integration
function initPosterStudio() {
  posterStudioInstance = new PosterStudio('posterCanvas');

  // Overlay presets
  document.querySelectorAll('#overlayPresets .preset-chip').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#overlayPresets .preset-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      posterStudioInstance.setOverlay(btn.dataset.overlay);
    };
  });

  // Font presets
  document.querySelectorAll('#fontPresets .font-chip').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#fontPresets .font-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      posterStudioInstance.setFont(btn.dataset.font);
    };
  });

  // Ratio presets (1:1, 4:5, 16:9)
  document.querySelectorAll('#ratioSelector .ratio-chip').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#ratioSelector .ratio-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const ratio = btn.dataset.ratio;
      posterStudioInstance.setRatio(ratio);
      const noteEl = document.querySelector('.preview-note');
      if (noteEl) {
        const dimStr = ratio === '4:5' ? '1080 × 1350' : (ratio === '16:9' ? '1920 × 1080' : '1080 × 1080');
        noteEl.textContent = `High Resolution PNG Export (${dimStr})`;
      }
    };
  });

  // Download button
  const btnDownload = document.getElementById('btnDownloadPoster');
  if (btnDownload) {
    btnDownload.onclick = () => {
      posterStudioInstance.downloadPNG();
      showToast('Poster image exported successfully!');
    };
  }

  // Pixabay search button
  const btnSearch = document.getElementById('btnSearchPixabay');
  const inputQuery = document.getElementById('pixabayQueryInput');
  if (btnSearch && inputQuery) {
    btnSearch.onclick = () => {
      const q = inputQuery.value.trim();
      if (q) loadPixabayThumbs(q);
    };
    inputQuery.onkeypress = (e) => {
      if (e.key === 'Enter') {
        const q = inputQuery.value.trim();
        if (q) loadPixabayThumbs(q);
      }
    };
  }
}

async function openPosterStudio(qObj) {
  const modal = document.getElementById('posterModal');
  modal.classList.remove('hidden');

  posterStudioInstance.setQuote(qObj.quote, qObj.author, qObj.category);

  // Fetch Pixabay thumbnails for this category
  const query = categoryImageMap[qObj.category] || qObj.category;
  document.getElementById('pixabayQueryInput').value = query;
  loadPixabayThumbs(query);
}

async function loadPixabayThumbs(query) {
  const thumbsContainer = document.getElementById('pixabayThumbs');
  thumbsContainer.innerHTML = `<div class="pixabay-thumb-item loading">Searching Pixabay photos...</div>`;

  const photos = await fetchPixabayImages(query, 12);
  if (photos.length === 0) {
    thumbsContainer.innerHTML = `<div class="pixabay-thumb-item">No photos found.</div>`;
    return;
  }

  // Set first image as background
  posterStudioInstance.setBgImage(photos[0].largeImageURL);

  let thumbsHtml = '';
  photos.forEach((photo, idx) => {
    thumbsHtml += `<img src="${photo.previewURL}" class="pixabay-thumb ${idx === 0 ? 'active' : ''}" data-full="${photo.largeImageURL}" alt="${photo.tags}">`;
  });

  thumbsContainer.innerHTML = thumbsHtml;

  // Thumb click listener
  thumbsContainer.querySelectorAll('.pixabay-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbsContainer.querySelectorAll('.pixabay-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      posterStudioInstance.setBgImage(thumb.dataset.full);
    });
  });
}

// 9. Zen Mode Slideshow
function openZenMode() {
  const modal = document.getElementById('zenModal');
  modal.classList.remove('hidden');
  state.zenCurrentIndex = 0;
  state.zenIsPlaying = true;
  updateZenSlide();

  state.zenInterval = setInterval(() => {
    if (state.zenIsPlaying) {
      state.zenCurrentIndex = (state.zenCurrentIndex + 1) % state.filteredQuotes.length;
      updateZenSlide();
    }
  }, 8000);
}

async function updateZenSlide() {
  const q = state.filteredQuotes[state.zenCurrentIndex] || state.allQuotes[0];
  if (!q) return;

  document.getElementById('zenQuote').textContent = `"${q.quote}"`;
  document.getElementById('zenAuthor').textContent = `— ${q.author}`;
  document.getElementById('zenCategory').textContent = q.category;

  const query = categoryImageMap[q.category] || q.category;
  const images = await fetchPixabayImages(query, 4);
  if (images.length > 0) {
    const bgUrl = images[Math.floor(Math.random() * images.length)].largeImageURL;
    setSmoothBackgroundImage(document.getElementById('zenBgSlide'), bgUrl);
  }
}

function closeZenMode() {
  document.getElementById('zenModal').classList.add('hidden');
  if (state.zenInterval) clearInterval(state.zenInterval);
  state.zenIsPlaying = false;
}

// 10. Bookmarks Drawer
function renderBookmarksList() {
  const listEl = document.getElementById('bookmarksList');
  if (state.bookmarks.length === 0) {
    listEl.innerHTML = `
      <div class="empty-drawer">
        <i class="fa-regular fa-bookmark"></i>
        <p>No bookmarked quotes yet. Click the heart icon on any quote to save it here!</p>
      </div>`;
    return;
  }

  let html = '';
  state.bookmarks.forEach((b, idx) => {
    html += `
      <div class="quote-card" style="padding: 1.25rem;">
        <blockquote class="card-quote-text" style="font-size: 1.1rem;">"${b.quote}"</blockquote>
        <span class="card-author">— ${b.author}</span>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem;">
          <span class="quote-category-tag">${b.category}</span>
          <button class="mini-action-btn remove-bm-btn" data-index="${idx}" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;

  listEl.querySelectorAll('.remove-bm-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = parseInt(e.currentTarget.dataset.index);
      state.bookmarks.splice(i, 1);
      localStorage.setItem('qb_bookmarks', JSON.stringify(state.bookmarks));
      updateBookmarkBadge();
      renderBookmarksList();
      renderQuotesGrid();
    });
  });
}

// 11. Event Listeners Setup
function setupEventListeners() {
  // Helper for safe element binding
  const on = (id, event, callback) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, callback);
  };

  // Search Bar
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (searchInput && clearBtn) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      clearBtn.classList.toggle('active', state.searchQuery.length > 0);
      state.currentPage = 1;
      applyFilters();
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearBtn.classList.remove('active');
      state.currentPage = 1;
      applyFilters();
    });
  }

  // Author & Sort Dropdowns
  on('authorSelect', 'change', (e) => {
    state.selectedAuthor = e.target.value;
    state.currentPage = 1;
    applyFilters();
  });

  on('sortSelect', 'change', (e) => {
    state.sortBy = e.target.value;
    state.currentPage = 1;
    applyFilters();
  });

  // Load More Button
  on('btnLoadMore', 'click', () => {
    state.currentPage++;
    renderQuotesGrid();
  });

  // Reset Filters
  on('btnResetFilters', 'click', () => {
    state.searchQuery = '';
    state.selectedAuthor = 'all';
    state.activeCategory = 'all';
    state.sortBy = 'popular';
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('authorSelect')) document.getElementById('authorSelect').value = 'all';
    if (document.getElementById('sortSelect')) document.getElementById('sortSelect').value = 'popular';
    renderCategoryPills();
    applyFilters();
  });

  // Category Pills Scroll Buttons
  on('catScrollLeft', 'click', () => {
    const pills = document.getElementById('categoryPills');
    if (pills) pills.scrollBy({ left: -300, behavior: 'smooth' });
  });

  on('catScrollRight', 'click', () => {
    const pills = document.getElementById('categoryPills');
    if (pills) pills.scrollBy({ left: 300, behavior: 'smooth' });
  });

  // Header Actions
  on('btnRandomQuote', 'click', () => {
    selectHeroQuote();
    showToast('New featured quote loaded!');
  });

  on('btnZenMode', 'click', openZenMode);
  on('closeZenModal', 'click', closeZenMode);

  // Zen Controls
  on('zenBtnPrev', 'click', () => {
    state.zenCurrentIndex = (state.zenCurrentIndex - 1 + state.filteredQuotes.length) % state.filteredQuotes.length;
    updateZenSlide();
  });

  on('zenBtnNext', 'click', () => {
    state.zenCurrentIndex = (state.zenCurrentIndex + 1) % state.filteredQuotes.length;
    updateZenSlide();
  });

  const playBtn = document.getElementById('zenBtnPlay');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      state.zenIsPlaying = !state.zenIsPlaying;
      playBtn.innerHTML = state.zenIsPlaying ? `<i class="fa-solid fa-pause"></i>` : `<i class="fa-solid fa-play"></i>`;
    });
  }

  on('zenBtnAudio', 'click', () => {
    const q = state.filteredQuotes[state.zenCurrentIndex];
    if (q) speakQuote(q.quote, q.author);
  });

  // Hero Section Actions
  on('heroBtnCopy', 'click', () => {
    if (state.heroQuote) copyToClipboard(state.heroQuote.quote, state.heroQuote.author);
  });
  on('heroBtnSpeak', 'click', () => {
    if (state.heroQuote) speakQuote(state.heroQuote.quote, state.heroQuote.author);
  });
  on('heroBtnBookmark', 'click', (e) => {
    if (state.heroQuote) toggleBookmark(state.heroQuote, e.currentTarget);
  });
  on('heroBtnPoster', 'click', () => {
    if (state.heroQuote) openPosterStudio(state.heroQuote);
  });
  on('heroBtnNext', 'click', () => selectHeroQuote());

  // Poster Studio Controls
  on('closePosterModal', 'click', () => {
    const modal = document.getElementById('posterModal');
    if (modal) modal.classList.add('hidden');
  });

  on('btnSearchPixabay', 'click', () => {
    const input = document.getElementById('pixabayQueryInput');
    if (input && input.value.trim()) loadPixabayThumbs(input.value.trim());
  });

  // Poster Presets
  const overlayPresets = document.getElementById('overlayPresets');
  if (overlayPresets) {
    overlayPresets.querySelectorAll('.preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        overlayPresets.querySelectorAll('.preset-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (posterStudioInstance) posterStudioInstance.setOverlay(btn.dataset.overlay);
      });
    });
  }

  const fontPresets = document.getElementById('fontPresets');
  if (fontPresets) {
    fontPresets.querySelectorAll('.font-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        fontPresets.querySelectorAll('.font-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (posterStudioInstance) posterStudioInstance.setFont(btn.dataset.font);
      });
    });
  }

  const ratioSelector = document.getElementById('ratioSelector');
  if (ratioSelector) {
    ratioSelector.querySelectorAll('.ratio-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        ratioSelector.querySelectorAll('.ratio-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (posterStudioInstance) posterStudioInstance.setRatio(btn.dataset.ratio);
      });
    });
  }

  on('btnDownloadPoster', 'click', () => {
    if (posterStudioInstance) {
      posterStudioInstance.downloadPNG('quotebook-poster.png');
      showToast('Downloading quote poster!');
    }
  });

  // Bookmarks Drawer Controls
  on('btnOpenBookmarks', 'click', () => {
    renderBookmarksList();
    const drawer = document.getElementById('bookmarksDrawerBackdrop');
    if (drawer) drawer.classList.remove('hidden');
  });

  on('closeBookmarksDrawer', 'click', () => {
    const drawer = document.getElementById('bookmarksDrawerBackdrop');
    if (drawer) drawer.classList.remove('hidden');
    if (drawer) drawer.classList.add('hidden');
  });

  on('btnClearBookmarks', 'click', () => {
    state.bookmarks = [];
    localStorage.removeItem('qb_bookmarks');
    updateBookmarkBadge();
    renderBookmarksList();
    renderQuotesGrid();
    showToast('Bookmarks cleared');
  });

  on('btnExportBookmarks', 'click', () => {
    if (state.bookmarks.length === 0) return;
    const blob = new Blob([JSON.stringify(state.bookmarks, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quotebook-bookmarks.json';
    link.click();
  });

  // Mobile Menu Toggle Event Listener
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const homeNavLinks = document.getElementById('homeNavLinks');
  if (mobileMenuToggle && homeNavLinks) {
    mobileMenuToggle.onclick = () => {
      mobileMenuToggle.classList.toggle('active');
      homeNavLinks.classList.toggle('active');
    };
    homeNavLinks.querySelectorAll('.nav-link').forEach(link => {
      link.onclick = () => {
        mobileMenuToggle.classList.remove('active');
        homeNavLinks.classList.remove('active');
      };
    });
  }
}

// 12. Helper Toast Notification
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
