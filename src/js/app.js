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
  imageCache: {},  // Shared cache for Picsum images
  zenInterval: null,
  zenIsPlaying: false,
  zenCurrentIndex: 0,
  speechSynth: window.speechSynthesis || null,
  dataSaver: localStorage.getItem('dataSaverEnabled') === 'true',
  searchIndex: null,
  isSearchIndexLoading: false,
  workerSearchResults: [],
  currentWorkerQuery: '',
  searchWorker: null
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

window.addEventListener('pageshow', () => {
  document.body.classList.add('page-loaded');
});

document.addEventListener('DOMContentLoaded', () => {
  // Page load fade-in
  document.body.classList.add('page-loaded');
  initPageTransitions();
  
  initApp();
});

async function initApp() {
  setupEventListeners();

  if (state.dataSaver) {
    document.body.classList.add('data-saver-active');
  }
  updateDataSaverButtonUI();

  const isQuotesPage = document.body.classList.contains('quotes-page');
  const isHomePage = document.body.classList.contains('home-page');
  const isPosterPage = document.body.classList.contains('poster-page-body');

  if (isQuotesPage || isPosterPage) {
    initPosterStudio();
  }
  
  if (isQuotesPage) {
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
      if (catParam) {
        let matchedCat = null;
        if (state.categoriesMap[catParam]) {
          matchedCat = catParam;
        } else if (catParam.includes(' - ')) {
          const baseCategory = catParam.split(' - ')[0].trim();
          if (state.categoriesMap[baseCategory]) {
            matchedCat = baseCategory;
          }
        }
        
        // Fuzzy & Slug matching fallback
        if (!matchedCat) {
          const catClean = catParam.toLowerCase().replace(/[^a-z0-9]/g, '');
          Object.keys(state.categoriesMap).forEach(key => {
            const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (keyClean === catClean || keyClean.includes(catClean) || catClean.includes(keyClean)) {
              matchedCat = key;
            }
          });
        }

        if (matchedCat) {
          state.activeCategory = matchedCat;
        }
      }

      // Auto lazy-load category chunk data before UI render!
      if (state.activeCategory !== 'all') {
        await window.lazyLoadCategory(state.activeCategory);
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
    
    // Run scroll-reveal on static cards
    initScrollReveal();

    // Bind listeners to statically rendered cards on pSEO pages
    bindStaticCardListeners();
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
      window.location.href = `quotes?action=poster&quote=${encodeURIComponent(q)}&author=${encodeURIComponent(a)}&category=${encodeURIComponent(c)}`;
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
    } else if (!bgEl.style.backgroundImage) {
      bgEl.style.backgroundImage = 'linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
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
      const shortQuotes = state.allQuotes.filter(q => q.quote.length <= 85);
      const pool = shortQuotes.length > 0 ? shortQuotes : state.allQuotes;
      const q = pool[mockupCurrentIndex % pool.length];
      if (q) speakQuote(q.quote, q.author);
    });
  }
}

async function updateHomeDeviceQuote() {
  if (state.allQuotes.length === 0) return;
  
  // Filter for shorter quotes so the Zen Mode mockup looks clean and doesn't overflow
  const shortQuotes = state.allQuotes.filter(q => q.quote.length <= 85);
  const pool = shortQuotes.length > 0 ? shortQuotes : state.allQuotes;
  const q = pool[mockupCurrentIndex % pool.length];

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
    const applyMockupFallback = () => {
      bgEl.style.backgroundImage = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #2d3561 100%)';
      bgEl.style.opacity = '1';
    };
    if (images.length > 0) {
      const bgUrl = images[Math.floor(Math.random() * images.length)].webformatURL;
      setSmoothBackgroundImage(bgEl, bgUrl, applyMockupFallback);
    } else {
      applyMockupFallback();
    }
  }
}

// Helper: Preload image then crossfade it in as a CSS background.
// onFail (optional) is called if the image errors OR stalls for >6 s — use it
// to apply a fallback gradient so the element is never left blank forever.
// NOTE: crossOrigin is intentionally NOT set here — these backgrounds are only
// ever used as CSS background-image, never drawn onto <canvas>, so CORS headers
// are not needed and setting crossOrigin would add an extra failure mode for free.
function setSmoothBackgroundImage(element, imageUrl, onFail) {
  if (!element || !imageUrl) return;

  const tempImg = new Image();
  let settled = false;

  // Safety net: if the image neither loads nor errors within 6 s (stalled request
  // on a slow/offline connection), stop waiting and fall back gracefully.
  const fallbackTimer = setTimeout(() => {
    if (settled) return;
    settled = true;
    console.warn('[Quotebook] Background image timed out:', imageUrl);
    if (typeof onFail === 'function') onFail();
  }, 6000);

  tempImg.onload = () => {
    if (settled) return;
    settled = true;
    clearTimeout(fallbackTimer);
    element.style.transition = 'opacity 0.4s ease-in-out, background-image 0.4s ease-in-out';
    element.style.backgroundImage = `url('${imageUrl}')`;
    element.style.opacity = '1';
  };

  tempImg.onerror = () => {
    if (settled) return;
    settled = true;
    clearTimeout(fallbackTimer);
    console.warn('[Quotebook] Background image failed to load:', imageUrl);
    if (typeof onFail === 'function') onFail();
  };

  tempImg.src = imageUrl;
}

// 1. Optimized Data Loader (Lazy-loading Category Chunks)
async function loadQuotesData() {
  // Stage 1: Load lightweight featured dataset FIRST for instant sub-10ms UI render
  try {
    const resFeatured = await fetch('data/featured_quotes.json');
    if (resFeatured.ok) {
      const featData = await resFeatured.json();
      processDataset(featData);
    }
  } catch (err) {
    console.warn("Featured dataset fetch warning:", err);
  }

  // Stage 2: Load metadata to populate category dropdowns
  try {
    const resMeta = await fetch('data/metadata.json');
    if (resMeta.ok) {
      const metadata = await resMeta.json();
      
      // Initialize empty categories map from metadata
      Object.keys(metadata.categories).forEach(catName => {
        if (!state.categoriesMap[catName]) {
          state.categoriesMap[catName] = { quotes: [], _meta: metadata.categories[catName], loaded: false };
        }
      });

      const badge = document.getElementById('quoteCountBadge');
      if (badge) {
        let total = 0;
        Object.values(metadata.categories).forEach(c => total += c.count);
        badge.textContent = `${total.toLocaleString()} Quotes Available`;
      }

      if (typeof renderCategoryPills === 'function') renderCategoryPills();
      if (typeof populateAuthorDropdown === 'function') populateAuthorDropdown();
      
      // Initialize Web Worker for massive global searching
      if (window.Worker && !state.searchWorker) {
          state.searchWorker = new Worker('src/js/searchWorker.js');
          const files = Object.values(metadata.categories).map(c => c.file);
          state.searchWorker.postMessage({ type: 'INIT', payload: { files } });
          
          state.searchWorker.onmessage = function(e) {
              const { type, payload } = e.data;
              if (type === 'RESULTS') {
                  // Append new unique results
                  payload.results.forEach(r => {
                      if (!state.workerSearchResults.some(existing => existing.quote === r.quote)) {
                          state.workerSearchResults.push(r);
                      }
                  });
                  
                  // If still on the same query and in global view, re-render!
                  if (state.activeCategory === 'all' && state.searchQuery && state.searchQuery === state.currentWorkerQuery) {
                      applyFilters(true); // true = skip triggering a new search
                  }
              }
          };
      }
    }
  } catch (err) {
    console.warn("Metadata background load notice:", err);
  }
}

// Lazy load a specific category when selected
window.lazyLoadCategory = async function(catName) {
  const catObj = state.categoriesMap[catName];
  if (!catObj || catObj.loaded || !catObj._meta) return true;
  
  try {
    const res = await fetch(catObj._meta.file);
    if (res.ok) {
      const data = await res.json();
      catObj.quotes = data.quotes || [];
      catObj.loaded = true;
      
      // Append to allQuotes
      catObj.quotes.forEach(q => {
        state.allQuotes.push({
          quote: q.quote,
          author: q.author || 'Unknown',
          tags: q.tags || [],
          popularity: q.popularity || 0,
          category: catName
        });
      });
      
      if (typeof populateAuthorDropdown === 'function') populateAuthorDropdown();
      return true;
    }
  } catch (err) {
    console.error("Failed to lazy load category:", err);
  }
  return false;
};


function processDataset(dataObj) {
  state.quotesData = dataObj;
  state.categoriesMap = dataObj.categories || {};
  
  const quotesList = [];
  Object.keys(state.categoriesMap).forEach(catName => {
    const catObj = state.categoriesMap[catName];
    if (catObj && Array.isArray(catObj.quotes)) {
      catObj.loaded = true;
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
  if (!container) return;
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
    pill.addEventListener('click', async () => {
      container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.dataset.category;
      
      // Lazy load the category if not "all"
      if (state.activeCategory !== 'all') {
        await window.lazyLoadCategory(state.activeCategory);
      }
      
      state.currentPage = 1;
      applyFilters();
    });
  });
}

// 3. Populate Authors Filter Dropdown
function populateAuthorDropdown() {
  const select = document.getElementById('authorSelect');
  if (!select) return;
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
  const textEl = document.getElementById('heroQuoteText');
  if (!textEl) return;

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

  textEl.textContent = `"${h.quote}"`;
  document.getElementById('heroAuthorTag').textContent = `— ${h.author}`;
  document.getElementById('heroCategoryTag').innerHTML = `<i class="fa-solid fa-sparkles"></i> ${h.category}`;

  // Tags
  const tagsContainer = document.getElementById('heroTagsList');
  tagsContainer.innerHTML = h.tags.slice(0, 3).map(t => `<span class="tag-chip">${t}</span>`).join('');

  // Update Hero Pixabay Background Image
  const query = categoryImageMap[h.category] || h.category;
  const images = await fetchPixabayImages(query, 5);
  const heroBackdrop = document.getElementById('heroBackdrop');
  const applyHeroFallback = () => {
    if (!heroBackdrop) return;
    heroBackdrop.style.backgroundImage = 'linear-gradient(135deg, #2C3E50 0%, #3D5A80 40%, #8B5E52 100%)';
    heroBackdrop.style.opacity = '1';
  };
  if (images.length > 0) {
    const bgUrl = images[Math.floor(Math.random() * images.length)].webformatURL;
    setSmoothBackgroundImage(heroBackdrop, bgUrl, applyHeroFallback);
  } else {
    applyHeroFallback();
  }
}

// ─────────────────────────────────────────────────────────────────────
// 5.  IMAGE API  —  Picsum Photos (picsum.photos)
//     • No API key required   • No domain registration needed
//     • CORS-safe from any browser / domain   • Beautiful HD photos
//     • Deterministic seeds: same category → same image every time
// ─────────────────────────────────────────────────────────────────────

// Map every quote category to a stable Picsum photo seed (integer 1–1000)
const categoryPicsumSeed = {
  'Age & Aging':                 27,
  'Ambition & Goals':            18,
  'Art & Creativity':            103,
  'Beauty & Aesthetics':         74,
  'Books & Reading':             24,
  'Change & Growth':             15,
  'Character & Integrity':       42,
  'Courage & Bravery':           116,
  'Death & Mortality':           64,
  'Dreams & Aspirations':        11,
  'Education & Learning':        29,
  'Equality & Justice':          60,
  'Experience & Practice':       39,
  'Failure & Resilience':        85,
  'Faith & Spirituality':        96,
  'Family & Parenting':          43,
  'Famous Quotes':               80,
  'Fear & Courage':              112,
  'Freedom & Liberty':            4,
  'Friendship & Companionship':   50,
  'Future & Progress':           200,
  'Gratitude & Thankfulness':    57,
  'Happiness & Joy':             58,
  'Health & Wellness':           237,
  'Hope & Optimism':             23,
  'Humor & Wit':                 99,
  'Imagination & Creativity':    167,
  'Kindness & Compassion':       63,
  'Life & Living':               33,
  'Love & Relationships':        76,
  'Mind & Consciousness':        119,
  'Money & Wealth':              155,
  'Motivation & Inspiration':    177,
  'Music & Art':                 145,
  'Nature & Environment':         3,
  'Patience & Perseverance':     190,
  'Peace & Harmony':             91,
  'Philosophy & Thinking':       129,
  'Power & Leadership':          65,
  'Purpose & Meaning':           321,
  'Science & Discovery':         250,
  'Self & Identity':             117,
  'Simplicity & Minimalism':     137,
  'Strength & Resilience':       166,
  'Success & Achievement':       380,
  'Technology & Innovation':     202,
  'Time & Patience':             231,
  'Truth & Honesty':             98,
  'Wisdom & Knowledge':          122,
  'Work & Career':               274
};

/**
 * Build a Picsum image object for a given seed and size.
 * Returns an object compatible with all call-sites:
 *   .url        — the full-size image for backgrounds / canvas
 *   .previewUrl — smaller thumbnail for the photo picker grid
 *   .fullUrl    — alias for .url (for poster canvas)
 *   .id         — numeric seed (for keying)
 */
function buildPicsumImage(seed, width = 1280, height = 853) {
  const base = `https://picsum.photos/seed/${seed}`;
  return {
    id:         seed,
    url:        `${base}/${width}/${height}`,
    fullUrl:    `${base}/${width}/${height}`,
    previewUrl: `${base}/320/214`,
    // Legacy aliases so existing code using .webformatURL / .largeImageURL still works:
    webformatURL:  `${base}/${width}/${height}`,
    largeImageURL: `${base}/${width}/${height}`,
    previewURL:    `${base}/320/214`,
    tags: `picsum seed ${seed}`
  };
}

/**
 * Returns an array of image objects for a given category / search query.
 * Primary source: Picsum Photos (always works, no key needed).
 * Generates `count` varied seeds based on the category's base seed.
 */
async function fetchImages(query, count = 10) {
  if (state.dataSaver) return [];

  const cacheKey = `${query}:${count}`;
  if (state.imageCache[cacheKey]) return state.imageCache[cacheKey];

  // Derive a base seed from the category or query string
  const baseSeed = categoryPicsumSeed[query]
    || Math.abs([...String(query)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % 900 + 50;

  // Generate `count` varied seeds around the base (offset by prime steps)
  const primeOffsets = [0, 7, 17, 37, 53, 71, 89, 103, 127, 149, 163, 181];
  const images = primeOffsets.slice(0, count).map(offset =>
    buildPicsumImage(baseSeed + offset)
  );

  state.imageCache[cacheKey] = images;
  return images;
}

// ─── Legacy alias so any remaining fetchPixabayImages calls still work ───
const fetchPixabayImages = fetchImages;

// 6. Filtering & Rendering Logic
function applyFilters(skipWorkerTrigger = false) {
  let list = [...state.allQuotes];

  // Category Filter
  if (state.activeCategory !== 'all') {
    list = list.filter(q => q.category === state.activeCategory);
  }

  // Search Input Query Filter
  if (state.searchQuery) {
    const qLower = state.searchQuery.toLowerCase();
    
    // Global Search: if we are in 'all' category
    if (state.activeCategory === 'all') {
      // Trigger Web Worker if it's a new query
      if (!skipWorkerTrigger && state.searchWorker && state.searchQuery !== state.currentWorkerQuery) {
          state.currentWorkerQuery = state.searchQuery;
          state.workerSearchResults = []; // reset results
          state.searchWorker.postMessage({ type: 'SEARCH', payload: { query: qLower } });
      }
      
      // Filter whatever is in allQuotes instantly
      const localMatches = list.filter(q => 
        q.quote.toLowerCase().includes(qLower) ||
        q.author.toLowerCase().includes(qLower) ||
        (q.tags && q.tags.some(t => t.toLowerCase().includes(qLower)))
      );
      
      // Combine local matches with streamed worker matches
      list = [...localMatches];
      
      // Add worker results avoiding duplicates
      state.workerSearchResults.forEach(wr => {
          if (!list.some(l => l.quote === wr.quote)) {
              list.push(wr);
          }
      });
      
    } else {
      // Local Category Search
      list = list.filter(q => 
        q.quote.toLowerCase().includes(qLower) ||
        q.author.toLowerCase().includes(qLower) ||
        (q.tags && q.tags.some(t => t.toLowerCase().includes(qLower)))
      );
    }
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

  // Dynamic SEO meta updates
  if (state.activeCategory !== 'all') {
    updateSEO(
      `Explore ${state.activeCategory} Quotes — Quotebook`,
      `Discover and read curated ${state.activeCategory} quotes by timeless authors. Pair quotes with photography live from Pixabay.`,
      state.activeCategory
    );
  } else if (state.searchQuery) {
    updateSEO(
      `Search: "${state.searchQuery}" Quotes — Quotebook`,
      `Find curated quotes matching search query "${state.searchQuery}". Browse, read aloud, and generate canvas posters.`
    );
  } else {
    updateSEO(
      `Quotes Library & Canvas Poster Studio — Quotebook`,
      `Discover 1 Million+ curated quotes, listen with speech synthesis, and create high-resolution quote posters.`
    );
  }
}

function renderQuotesGrid() {
  const grid = document.getElementById('quotesGrid');
  const noResults = document.getElementById('noResultsView');
  const loadMoreBtn = document.getElementById('loadMoreContainer');
  const title = document.getElementById('currentSectionTitle');
  const count = document.getElementById('resultsCount');

  if (!grid || !title || !count) return;

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
          <span class="quote-pop-badge"><i class="fa-solid fa-fire"></i> ${((q.popularity || 0) * 100).toFixed(1)}</span>
        </div>
        
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"${q.quote}"</blockquote>
          <span class="card-author">&mdash; ${q.author}</span>
        </div>

        <div class="quote-card-footer">
          <div class="card-tags">
            ${q.tags.slice(0, 2).map(t => `<span class="mini-tag">#${t}</span>`).join('')}
          </div>
          <div class="card-actions">
            <button class="mini-action-btn card-btn-copy" title="Copy Text"><i class="fa-regular fa-copy"></i></button>
            <button class="mini-action-btn card-btn-bookmark" title="Bookmark"><i class="${heartIcon}"></i></button>
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
    card.querySelector('.card-btn-bookmark').addEventListener('click', (e) => toggleBookmark(qObj, e.currentTarget));
  });

  // Trigger staggered reveals for newly loaded/rendered cards
  initScrollReveal();
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

const _bookmarkDebounce = new Set();
function toggleBookmark(qObj, btnEl) {
  if (!qObj || !qObj.quote) return;

  // Guard: prevent double-fire for the same quote within 500ms (e.g. mobile touch + click)
  const key = `${qObj.quote}:::${qObj.author || ''}`;
  if (_bookmarkDebounce.has(key)) return;
  _bookmarkDebounce.add(key);
  setTimeout(() => _bookmarkDebounce.delete(key), 500);

  const index = state.bookmarks.findIndex(b => b.quote === qObj.quote && b.author === qObj.author);
  if (index > -1) {
    state.bookmarks.splice(index, 1);
    if (btnEl) {
      const icon = btnEl.querySelector('i');
      if (icon) icon.className = 'fa-regular fa-heart';
    }
    showToast('Removed from saved quotes');
  } else {
    state.bookmarks.push(qObj);
    if (btnEl) {
      const icon = btnEl.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-heart active text-danger';
    }
    showToast('Saved to bookmarks!');
  }

  localStorage.setItem('qb_bookmarks', JSON.stringify(state.bookmarks));
  updateBookmarkBadge();
  renderBookmarksList();
}

function updateBookmarkBadge() {
  const count = state.bookmarks.length;
  const badge = document.getElementById('bookmarkCount');
  if (badge) badge.textContent = count;
  const drawerBadge = document.getElementById('bookmarkCountDrawer');
  if (drawerBadge) drawerBadge.textContent = count > 0 ? count : '';
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

  // Custom text inputs for standalone poster.html page
  const customQuoteInput = document.getElementById('customQuoteInput');
  const customAuthorInput = document.getElementById('customAuthorInput');
  
  if (customQuoteInput && customAuthorInput) {
    const updateCustomQuote = () => {
      const q = customQuoteInput.value || "Your custom quote here...";
      const a = customAuthorInput.value || "Unknown";
      posterStudioInstance.setQuote(q, a, "Custom");
    };
    customQuoteInput.addEventListener('input', updateCustomQuote);
    customAuthorInput.addEventListener('input', updateCustomQuote);
    
    // Quotes Presets
    const presetsSelect = document.getElementById('quotePresetsSelect');
    if (presetsSelect) {
      presetsSelect.addEventListener('change', (e) => {
        if (!e.target.value) return;
        const [text, author] = e.target.value.split('|');
        customQuoteInput.value = text;
        customAuthorInput.value = author;
        updateCustomQuote();
      });
    }

    // Emojis
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        customQuoteInput.value += btn.dataset.emoji;
        updateCustomQuote();
      });
    });

    // Icons (Native Symbol Map)
    const iconMap = {
      'f004': '❤️', // Heart
      'f005': '★', // Star
      'f10d': '“', // Quote Left
      'f10e': '”', // Quote Right
      'f02d': '📖', // Book
      'f0eb': '💡', // Lightbulb
      'f06d': '🔥', // Fire
      'f18c': '🐛'  // Bug
    };
    
    document.querySelectorAll('.icon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const symbol = iconMap[btn.dataset.icon] || '';
        customQuoteInput.value += symbol;
        updateCustomQuote();
      });
    });
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

// ─── Photo picker for Poster Studio (replaces Pixabay thumbnail loader) ───
async function loadPixabayThumbs(query) {
  const thumbsContainer = document.getElementById('pixabayThumbs');
  if (!thumbsContainer) return;

  if (state.dataSaver) {
    thumbsContainer.innerHTML = `
      <div class="data-saver-notice" style="text-align:center; padding:1.5rem; color:var(--text-secondary); font-family:var(--font-sans);">
        <i class="fa-solid fa-leaf" style="color:var(--orange-600); font-size:1.75rem; margin-bottom:0.75rem; display:block;"></i>
        <p style="margin-bottom:0.75rem; font-size:0.9rem; font-weight:500;">Lite Mode is active. Photos are blocked to save internet data.</p>
        <button class="cta-header-btn" id="btnDisableLiteMode" style="padding:0.4rem 0.8rem; font-size:0.8rem; margin:0 auto; display:block; border-radius:8px;">Disable Lite Mode</button>
      </div>
    `;
    const btn = document.getElementById('btnDisableLiteMode');
    if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); toggleDataSaverMode(); });
    return;
  }

  // Loading state
  thumbsContainer.innerHTML = `
    <div style="text-align:center; padding:1.5rem; color:var(--text-secondary); font-family:var(--font-sans); font-size:0.875rem;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem; margin-bottom:0.5rem; display:block; color:var(--orange-600);"></i>
      Loading beautiful photos…
    </div>`;

  const photos = await fetchImages(query, 12);

  if (photos.length === 0) {
    thumbsContainer.innerHTML = `<div class="pixabay-thumb-item" style="text-align:center; padding:1rem;">No photos found for "${query}"</div>`;
    return;
  }

  // Auto-apply first photo to canvas
  posterStudioInstance.setBgImage(photos[0].url);

  // Build thumbnail grid
  let thumbsHtml = '';
  photos.forEach((photo, idx) => {
    thumbsHtml += `<img
      src="${photo.previewUrl}"
      class="pixabay-thumb ${idx === 0 ? 'active' : ''}"
      data-full="${photo.url}"
      alt="Photo ${photo.id}"
      loading="lazy"
      onerror="this.style.display='none'"
    >`;
  });
  thumbsContainer.innerHTML = thumbsHtml;

  // Click listener
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
  if (state.filteredQuotes.length === 0) {
    // Attempt to scrape from DOM for static SEO pages
    const cards = document.querySelectorAll('.quote-card');
    if (cards.length > 0) {
      state.filteredQuotes = Array.from(cards).map(card => {
        const textEl = card.querySelector('.card-quote-text');
        const authorEl = card.querySelector('.card-author');
        const catEl = card.querySelector('.quote-category-tag');
        
        return {
          quote: textEl ? textEl.textContent.replace(/^"|"$/g, '').trim() : '',
          author: authorEl ? authorEl.textContent.replace(/^[—–-]\s*/, '').trim() : 'Unknown',
          category: catEl ? catEl.textContent : 'Inspiration'
        };
      });
    }
  }

  if (state.filteredQuotes.length === 0 && state.allQuotes.length === 0) return;

  const modal = document.getElementById('zenModal');
  if (modal) modal.classList.remove('hidden');
  state.zenCurrentIndex = 0;
  state.zenIsPlaying = true;
  updateZenSlide();
  restartZenTimer();
}

function restartZenTimer() {
  if (state.zenInterval) clearInterval(state.zenInterval);
  state.zenInterval = setInterval(() => {
    if (state.zenIsPlaying) {
      const list = state.filteredQuotes.length > 0 ? state.filteredQuotes : state.allQuotes;
      if (list && list.length > 0) {
        state.zenCurrentIndex = (state.zenCurrentIndex + 1) % list.length;
        updateZenSlide();
      }
    }
  }, 8000);
}

function resetZenProgressBar() {
  const bar = document.getElementById('zenProgressBar');
  if (!bar) return;
  bar.style.transition = 'none';
  bar.style.width = '0';
  // Force browser layout reflow
  bar.offsetHeight;
  if (state.zenIsPlaying) {
    bar.style.transition = 'width 8000ms linear';
    bar.style.width = '100%';
  }
}

async function updateZenSlide() {
  const content = document.querySelector('.zen-content');
  if (content) content.classList.add('fade-out');

  setTimeout(async () => {
    const q = state.filteredQuotes[state.zenCurrentIndex] || state.allQuotes[0];
    if (!q) return;

    document.getElementById('zenQuote').textContent = `"${q.quote}"`;
    document.getElementById('zenAuthor').textContent = `— ${q.author}`;
    document.getElementById('zenCategory').textContent = q.category.toUpperCase();

    const query = categoryImageMap[q.category] || q.category;
    const images = await fetchPixabayImages(query, 4);
    const zenBgEl = document.getElementById('zenBgSlide');
    const applyZenFallback = () => {
      if (!zenBgEl) return;
      zenBgEl.style.backgroundImage = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #2d3561 100%)';
      zenBgEl.style.opacity = '1';
    };
    if (images.length > 0) {
      const bgUrl = images[Math.floor(Math.random() * images.length)].webformatURL;
      setSmoothBackgroundImage(zenBgEl, bgUrl, applyZenFallback);
    } else {
      applyZenFallback();
    }
    
    if (content) content.classList.remove('fade-out');
    resetZenProgressBar();
  }, 400);
}

function closeZenMode() {
  document.getElementById('zenModal').classList.add('hidden');
  if (state.zenInterval) clearInterval(state.zenInterval);
  state.zenIsPlaying = false;
  const bar = document.getElementById('zenProgressBar');
  if (bar) {
    bar.style.transition = 'none';
    bar.style.width = '0';
  }
}

// 10. Bookmarks Drawer
function renderBookmarksList() {
  const listEl = document.getElementById('bookmarksList');
  if (!listEl) return; // drawer not present on this page
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
    // Typing only buffers the query — grid stays frozen until Enter
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      clearBtn.classList.toggle('active', state.searchQuery.length > 0);
      // Grid stays stable — NO applyFilters() here
    });

    // Enter = commit search and update the grid
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const activeSuggestion = document.querySelector('.suggestion-item.keyboard-active');
        if (activeSuggestion) return; // suggestion engine handles navigation
        if (typeof window.hideSuggestionsGlobal === 'function') window.hideSuggestionsGlobal();
        state.currentPage = 1;
        applyFilters();
      }
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearBtn.classList.remove('active');
      state.currentPage = 1;
      applyFilters(); // clearing = immediate grid reset
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
    const list = state.filteredQuotes.length > 0 ? state.filteredQuotes : state.allQuotes;
    if (!list || list.length === 0) return;
    state.zenCurrentIndex = (state.zenCurrentIndex - 1 + list.length) % list.length;
    updateZenSlide();
    restartZenTimer();
  });

  on('zenBtnNext', 'click', () => {
    const list = state.filteredQuotes.length > 0 ? state.filteredQuotes : state.allQuotes;
    if (!list || list.length === 0) return;
    state.zenCurrentIndex = (state.zenCurrentIndex + 1) % list.length;
    updateZenSlide();
    restartZenTimer();
  });

  const playBtn = document.getElementById('zenBtnPlay');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      state.zenIsPlaying = !state.zenIsPlaying;
      playBtn.innerHTML = state.zenIsPlaying ? `<i class="fa-solid fa-pause"></i>` : `<i class="fa-solid fa-play"></i>`;
      if (state.zenIsPlaying) {
        restartZenTimer();
        updateZenSlide();
      } else {
        if (state.zenInterval) clearInterval(state.zenInterval);
        const bar = document.getElementById('zenProgressBar');
        if (bar) {
          bar.style.transition = 'none';
          bar.style.width = '0';
        }
      }
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

  on('btnOpenBookmarksMobile', 'click', () => {
    renderBookmarksList();
    const drawer = document.getElementById('bookmarksDrawerBackdrop');
    if (drawer) drawer.classList.remove('hidden');
  });

  on('closeBookmarksDrawer', 'click', () => {
    const drawer = document.getElementById('bookmarksDrawerBackdrop');
    if (drawer) drawer.classList.add('hidden');
  });

  on('bookmarksDrawerBackdrop', 'click', (e) => {
    const backdrop = document.getElementById('bookmarksDrawerBackdrop');
    if (e.target === backdrop) {
      backdrop.classList.add('hidden');
    }
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

  // Mobile Search Overlay Controls
  on('mobileSearchTrigger', 'click', () => {
    const search = document.getElementById('headerSearch');
    if (search) {
      search.classList.add('active');
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }
  });

  on('mobileSearchTriggerStrip', 'click', () => {
    const search = document.getElementById('headerSearch');
    if (search) {
      search.classList.add('active');
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }
  });

  on('closeSearchBtn', 'click', () => {
    const search = document.getElementById('headerSearch');
    if (search) search.classList.remove('active');
  });

  // Mobile Menu Toggle Event Listener (Home Page)
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

  // Mobile Drawer Toggle Event Listener (Quotes Page)
  const quotesMenuToggle = document.getElementById('quotesMenuToggle');
  const quotesMobileDrawer = document.getElementById('quotesMobileDrawer');
  
  function closeQuotesMobileMenu() {
    if (!quotesMenuToggle || !quotesMobileDrawer) return;
    quotesMenuToggle.setAttribute('aria-expanded', 'false');
    quotesMobileDrawer.classList.remove('active');
  }

  if (quotesMenuToggle && quotesMobileDrawer) {
    quotesMenuToggle.addEventListener('click', () => {
      const isExpanded = quotesMenuToggle.getAttribute('aria-expanded') === 'true';
      quotesMenuToggle.setAttribute('aria-expanded', !isExpanded);
      quotesMenuToggle.classList.toggle('active', !isExpanded);
      quotesMobileDrawer.classList.toggle('active', !isExpanded);
    });
  }

  // Bind Quotes Drawer Buttons
  on('drawerBtnRandom', 'click', () => {
    if (state.allQuotes.length > 0) selectHeroQuote();
    closeQuotesMobileMenu();
  });

  on('drawerBtnZen', 'click', () => {
    openZenMode();
    closeQuotesMobileMenu();
  });

  on('drawerBtnBookmarks', 'click', () => {
    renderBookmarksList();
    const drawer = document.getElementById('bookmarksDrawerBackdrop');
    if (drawer) drawer.classList.remove('hidden');
    closeQuotesMobileMenu();
  });

  // Mobile Drawer Search Logic
  const drawerSearchInput = document.getElementById('drawerSearchInput');
  const drawerSearchSubmit = document.getElementById('drawerSearchSubmit');
  
  const executeDrawerSearch = () => {
    if (!drawerSearchInput) return;
    const val = drawerSearchInput.value.trim();
    if (val) {
      const mainSearchInput = document.getElementById('searchInput');
      const clearBtn = document.getElementById('clearSearchBtn');
      if (mainSearchInput) mainSearchInput.value = val;
      state.searchQuery = val;
      if (clearBtn) clearBtn.classList.add('active');
      state.currentPage = 1;
      applyFilters();
      closeQuotesMobileMenu();
      drawerSearchInput.value = '';
    }
  };

  if (drawerSearchInput) {
    drawerSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeDrawerSearch();
    });
  }
  if (drawerSearchSubmit) {
    drawerSearchSubmit.addEventListener('click', executeDrawerSearch);
  }

  // Data Saver Toggle Click Event Delegation
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.lite-mode-toggle-btn');
    if (toggle) {
      e.preventDefault();
      toggleDataSaverMode();
    }
  });
}

function updateDataSaverButtonUI() {
  const toggles = document.querySelectorAll('.lite-mode-toggle-btn');
  toggles.forEach(toggle => {
    const statusEl = toggle.querySelector('.lite-status');
    if (state.dataSaver) {
      toggle.classList.add('active');
      if (statusEl) statusEl.textContent = 'On';
    } else {
      toggle.classList.remove('active');
      if (statusEl) statusEl.textContent = 'Off';
    }
  });
}

function toggleDataSaverMode() {
  state.dataSaver = !state.dataSaver;
  localStorage.setItem('dataSaverEnabled', state.dataSaver);
  
  if (state.dataSaver) {
    document.body.classList.add('data-saver-active');
    
    // Clear backdrops in DOM immediately to stop showing images
    const heroBg = document.getElementById('heroBackdrop');
    if (heroBg) {
      heroBg.style.backgroundImage = 'none';
      heroBg.style.opacity = '1';
    }
    const zenBg = document.getElementById('zenBgSlide');
    if (zenBg) {
      zenBg.style.backgroundImage = 'none';
      zenBg.style.opacity = '1';
    }
    const deviceBg = document.getElementById('mockupZenBg');
    if (deviceBg) {
      deviceBg.style.backgroundImage = 'none';
      deviceBg.style.opacity = '1';
    }
    if (posterStudioInstance) {
      posterStudioInstance.setBgImage(null); // fallback to gradient
    }
    showToast('Lite Mode active. Data saving enabled.');
  } else {
    document.body.classList.remove('data-saver-active');
    
    // Reload backgrounds
    if (state.heroQuote) {
      selectHeroQuote(state.heroQuote);
    }
    updateHomeDeviceQuote();
    showToast('Lite Mode disabled. Photos enabled.');
  }
  
  updateDataSaverButtonUI();
  
  // Reload Poster Studio list if it's currently open
  const modal = document.getElementById('posterModal');
  if (modal && !modal.classList.contains('hidden')) {
    const input = document.getElementById('pixabayQueryInput');
    if (input) loadPixabayThumbs(input.value || 'nature');
  }
}

// 12. Helper Toast Notification
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 13. Page-Level Transitions
function initPageTransitions() {
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
      link.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        document.body.classList.remove('page-loaded');
      });
    }
  });
}

// 14. Scroll-Triggered Reveal Animations
function initScrollReveal() {
  const elements = document.querySelectorAll('.quote-card, .feature-card, .popular-cats-grid a, .poster-preview-card, .today-quote-card');
  if (elements.length === 0) return;

  elements.forEach(el => {
    // Only apply if not already revealed
    if (!el.classList.contains('revealed')) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      el.classList.add('scroll-item');
    }
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          entry.target.classList.add('revealed');
        }, idx * 40);
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px'
  });

  elements.forEach(el => {
    if (!el.classList.contains('revealed')) {
      observer.observe(el);
    }
  });
}

// 15. Dynamic Marquee Categories Ticker Sourced from Live Data
function updateDynamicMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  
  const categories = Object.keys(state.categoriesMap);
  if (categories.length === 0) return;
  
  let marqueeHtml = '';
  // Repeat list twice for seamless infinite scrolling loop
  for (let loop = 0; loop < 2; loop++) {
    categories.forEach(cat => {
      const count = state.categoriesMap[cat].count || state.categoriesMap[cat].quotes.length;
      let icon = 'fa-solid fa-quote-left';
      if (cat.includes('Wisdom') || cat.includes('Mind')) icon = 'fa-solid fa-brain';
      else if (cat.includes('Books') || cat.includes('Reading')) icon = 'fa-solid fa-book-open';
      else if (cat.includes('Love') || cat.includes('Relationships')) icon = 'fa-solid fa-heart';
      else if (cat.includes('Motivation') || cat.includes('Inspiration')) icon = 'fa-solid fa-fire';
      else if (cat.includes('Philosophy') || cat.includes('Thinking')) icon = 'fa-solid fa-landmark';
      else if (cat.includes('Art') || cat.includes('Music') || cat.includes('Creativity')) icon = 'fa-solid fa-palette';
      else if (cat.includes('Nature') || cat.includes('Environment')) icon = 'fa-solid fa-leaf';
      else if (cat.includes('Science') || cat.includes('Discovery')) icon = 'fa-solid fa-atom';
      
      marqueeHtml += `<span><i class="${icon}"></i> ${cat} (${count})</span>`;
    });
  }
  track.innerHTML = marqueeHtml;
}

// 16. Dynamic SEO & Social Metadata Updates with JSON-LD Schema Integration
function updateSEO(pageTitle, pageDesc, categoryName = null) {
  document.title = pageTitle;

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = pageDesc;

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  const currentUrl = window.location.origin + window.location.pathname;
  canonical.href = categoryName 
    ? `${currentUrl}?category=${encodeURIComponent(categoryName)}` 
    : currentUrl;

  // Open Graph and Twitter Card tags
  const metaProperties = {
    'og:title': pageTitle,
    'og:description': pageDesc,
    'og:url': window.location.href,
    'og:type': 'website',
    'twitter:title': pageTitle,
    'twitter:description': pageDesc,
    'twitter:card': 'summary_large_image'
  };

  Object.entries(metaProperties).forEach(([prop, val]) => {
    let meta = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      if (prop.startsWith('og:')) {
        meta.setAttribute('property', prop);
      } else {
        meta.name = prop;
      }
      document.head.appendChild(meta);
    }
    meta.content = val;
  });

  // Inject JSON-LD Schema
  let schemaScript = document.getElementById('jsonLdSchema');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.type = "application/ld+json";
    schemaScript.id = "jsonLdSchema";
    document.head.appendChild(schemaScript);
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDesc,
    "url": window.location.href
  };

  if (document.body.classList.contains('home-page')) {
    schemaData["@type"] = "WebSite";
    schemaData["potentialAction"] = {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${window.location.origin}/quotes?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    };
  } else if (categoryName && state.categoriesMap[categoryName]) {
    schemaData["breadcrumb"] = {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${window.location.origin}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Explore",
          "item": `${window.location.origin}/quotes`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": categoryName,
          "item": window.location.href
        }
      ]
    };
  }

  schemaScript.textContent = JSON.stringify(schemaData, null, 2);
}

// 17. Progressive Enhancement Binder for Statically Rendered Quotes on pSEO Pages
function bindStaticCardListeners() {
  const staticCards = document.querySelectorAll('.quotes-grid .quote-card');
  if (staticCards.length === 0) return;

  staticCards.forEach(card => {
    const textEl = card.querySelector('.card-quote-text');
    const authorEl = card.querySelector('.card-author');
    const catEl = card.querySelector('.quote-category-tag');
    
    const quoteText = textEl ? textEl.textContent.replace(/^"|"$/g, '') : '';
    const quoteAuthor = authorEl ? authorEl.textContent.replace(/^[—–-]\s*/, '') : 'Unknown';
    const quoteCat = catEl ? catEl.textContent : 'General';
    
    const quoteObj = {
      quote: quoteText,
      author: quoteAuthor,
      category: quoteCat,
      tags: []
    };

    const copyBtn = card.querySelector('.card-btn-copy');
    const bookmarkBtn = card.querySelector('.card-btn-bookmark');

    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(quoteText, quoteAuthor);
      });
    }
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBookmark(quoteObj, e.currentTarget);
      });
    }
  });
}

/* ==========================================================================
   DYNAMIC AUTHOR PROFILES (Wikipedia REST API)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const authorWidget = document.getElementById('authorProfileWidget');
  if (authorWidget) {
    const authorName = authorWidget.getAttribute('data-author');
    if (authorName) {
      loadAuthorProfile(authorName, authorWidget);
    }
  }
});

async function loadAuthorProfile(authorName, container) {
  // Add skeleton loader immediately
  container.className = 'author-profile-card skeleton';
  container.innerHTML = `
    <div class="author-avatar">
      <div class="author-avatar-img"></div>
    </div>
    <div class="author-bio">
      <div class="author-bio-title"></div>
      <div class="author-bio-extract"></div>
      <div class="author-bio-extract" style="width: 80%"></div>
    </div>
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // MediaWiki REST API v1
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(authorName)}`;
    const response = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Graceful fallback if not found
      container.style.display = 'none';
      return;
    }

    const data = await response.json();
    
    // Check if it's a disambiguation page or missing extract
    if (data.type === 'disambiguation' || !data.extract) {
      container.style.display = 'none';
      return;
    }

    // Build the real profile
    // URL-encoded SVG to avoid breaking HTML attributes with quotes
    const defaultAvatar = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%25238C8079%22%3E%3Cpath%20d%3D%22M12%202C6.48%202%202%206.48%202%2012s4.48%2010%2010%2010%2010-4.48%2010-10S17.52%202%2012%202zm0%203c1.66%200%203%201.34%203%203s-1.34%203-3%203-3-1.34-3-3%201.34-3%203-3zm0%2014.2c-2.5%200-4.71-1.28-6-3.22.03-1.99%204-3.08%206-3.08%201.99%200%205.97%201.09%206%203.08-1.29%201.94-3.5%203.22-6%203.22z%22%2F%3E%3C%2Fsvg%3E';
    const imgSrc = data.thumbnail ? data.thumbnail.source : defaultAvatar;
    
    container.classList.remove('skeleton');
    container.innerHTML = `
      <div class="author-avatar">
        <img src="${imgSrc}" alt="${authorName}" class="author-avatar-img" onerror="this.src='${defaultAvatar}'; this.onerror=null;">
      </div>
      <div class="author-bio">
        <h2 class="author-bio-title">${data.title}</h2>
        <p class="author-bio-extract">${data.extract}</p>
        <a href="${data.content_urls.desktop.page}" target="_blank" rel="noopener noreferrer" class="author-bio-link">
          Read full biography on Wikipedia <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching author profile:', error);
    container.style.display = 'none'; // Hide gracefully on error
  }
}

/* ==========================================================================
   AUTHOR STORIES (INSTAGRAM STYLE)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const storyBarContainer = document.getElementById('storyBarContainer');
  const storyBarWrapper = document.getElementById('storyBarWrapper');
  const storyModal = document.getElementById('storyViewerModal');
  
  if (!storyBarContainer || !storyBarWrapper || !storyModal) return;

  // Wait for state.allQuotes to populate
  const checkInterval = setInterval(() => {
    if (state && state.allQuotes && state.allQuotes.length > 0) {
      clearInterval(checkInterval);
      initStories();
    }
  }, 500);

  let storyAuthors = [];
  let currentStoryAuthorIndex = 0;
  let currentSlideIndex = 0;
  let slideTimer;
  const slideDuration = 5000;
  let authorQuotes = [];

  async function initStories() {
    // 1. Get Top Authors by quote count
    const authorCounts = {};
    state.allQuotes.forEach(q => {
      if (q.author && q.author !== "Unknown") {
        authorCounts[q.author] = (authorCounts[q.author] || 0) + 1;
      }
    });

    // Sort descending and take top 100 to evaluate
    let topAuthors = Object.keys(authorCounts)
      .sort((a, b) => authorCounts[b] - authorCounts[a])
      .slice(0, 100);

    const wikiOverrides = {
      "Dalai Lama": "14th_Dalai_Lama",
      "Lao Tzu": "Laozi"
    };

    storyAuthors = [];
    
    for (let author of topAuthors) {
      if (storyAuthors.length >= 20) break; // Limit to 20 stories

      let cleanAuthor = author.includes(',') ? author.split(',')[0].trim() : author.trim();
      let queryName = wikiOverrides[cleanAuthor] ? wikiOverrides[cleanAuthor] : cleanAuthor;

      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(queryName)}`);
        if (!res.ok) continue;
        const data = await res.json();
        
        if (data.thumbnail && data.thumbnail.source) {
          storyAuthors.push({
            originalName: author,
            cleanName: cleanAuthor,
            displayName: cleanAuthor.split(' ')[0],
            imgSrc: data.thumbnail.source
          });
        }
      } catch (e) {}
    }

    if (storyAuthors.length === 0) return;
    
    storyBarContainer.style.display = 'block';
    
    // Render the rings
    storyAuthors.forEach((authorData, index) => {
      const el = document.createElement('div');
      el.className = 'story-item';
      el.innerHTML = `
        <div class="story-ring">
          <img src="${authorData.imgSrc}" alt="${authorData.cleanName}" class="story-avatar" id="storyAvatar-${index}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%25238C8079%22%3E%3Cpath%20d%3D%22M12%202C6.48%202%202%206.48%202%2012s4.48%2010%2010%2010%2010-4.48%2010-10S17.52%202%2012%202zm0%203c1.66%200%203%201.34%203%203s-1.34%203-3%203-3-1.34-3-3%201.34-3%203-3zm0%2014.2c-2.5%200-4.71-1.28-6-3.22.03-1.99%204-3.08%206-3.08%201.99%200%205.97%201.09%206%203.08-1.29%201.94-3.5%203.22-6%203.22z%22%2F%3E%3C%2Fsvg%3E'; this.onerror=null;">
        </div>
        <span class="story-author-name">${authorData.displayName}</span>
      `;
      el.addEventListener('click', () => openStory(index));
      storyBarWrapper.appendChild(el);
    });

    // Hook up scroll buttons
    const btnLeft = document.getElementById('storyScrollLeft');
    const btnRight = document.getElementById('storyScrollRight');
    
    if (btnLeft && btnRight) {
      btnLeft.addEventListener('click', () => {
        storyBarWrapper.scrollBy({ left: -200, behavior: 'smooth' });
      });
      btnRight.addEventListener('click', () => {
        storyBarWrapper.scrollBy({ left: 200, behavior: 'smooth' });
      });
    }
  }

  function openStory(authorIndex) {
    currentStoryAuthorIndex = authorIndex;
    const authorData = storyAuthors[currentStoryAuthorIndex];
    const author = authorData.originalName;
    let cleanAuthor = authorData.cleanName;
    
    // Mark as viewed
    storyBarWrapper.children[currentStoryAuthorIndex].classList.add('viewed');

    // Get random 3 quotes from this author
    const allAuthorQuotes = state.allQuotes.filter(q => q.author === author);
    // Shuffle
    allAuthorQuotes.sort(() => 0.5 - Math.random());
    authorQuotes = allAuthorQuotes.slice(0, 3);
    
    currentSlideIndex = 0;
    
    storyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Set Header
    document.getElementById('storyHeaderName').textContent = cleanAuthor;
    document.getElementById('storyHeaderAvatar').src = document.getElementById(`storyAvatar-${currentStoryAuthorIndex}`).src;
    
    renderSlide();
  }

  function renderSlide() {
    const progressContainer = document.getElementById('storyProgressContainer');
    progressContainer.innerHTML = '';
    
    // Create 4 segments
    for (let i = 0; i < 4; i++) {
      const segment = document.createElement('div');
      segment.className = 'story-progress-segment';
      const fill = document.createElement('div');
      fill.className = 'story-progress-fill';
      fill.id = `storyProgressFill-${i}`;
      if (i < currentSlideIndex) fill.classList.add('completed');
      segment.appendChild(fill);
      progressContainer.appendChild(segment);
    }
    
    const contentBox = document.getElementById('storyContent');
    const ctaBox = document.getElementById('storyCtaContent');
    const quoteText = document.getElementById('storyQuoteText');
    const ctaAuthor = document.getElementById('storyCtaAuthor');
    const ctaBtn = document.getElementById('storyCtaBtn');

    if (currentSlideIndex < 3) {
      // Show Quote
      contentBox.classList.remove('hidden');
      ctaBox.classList.add('hidden');
      
      if (authorQuotes[currentSlideIndex]) {
        quoteText.textContent = `"${authorQuotes[currentSlideIndex].quote}"`;
      }
    } else {
      // Show CTA (Slide 4)
      contentBox.classList.add('hidden');
      ctaBox.classList.remove('hidden');
      ctaAuthor.textContent = storyAuthors[currentStoryAuthorIndex].cleanName;
      
      // Generate URL slug for the button
      let slug = storyAuthors[currentStoryAuthorIndex].cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      ctaBtn.href = `authors/${slug}.html`;
    }

    // Start Timer
    clearTimeout(slideTimer);
    
    // Trigger animation next frame
    requestAnimationFrame(() => {
      const activeFill = document.getElementById(`storyProgressFill-${currentSlideIndex}`);
      if (activeFill) {
        // Reset without transition first to ensure it's at 0
        activeFill.style.transition = 'none';
        activeFill.style.width = '0%';
        
        requestAnimationFrame(() => {
          activeFill.style.transition = `width ${slideDuration}ms linear`;
          activeFill.style.width = '100%';
        });
      }
    });

    slideTimer = setTimeout(() => {
      advanceSlide();
    }, slideDuration);
  }

  function advanceSlide() {
    currentSlideIndex++;
    if (currentSlideIndex >= 4) {
      // Next Author
      currentStoryAuthorIndex++;
      if (currentStoryAuthorIndex >= storyAuthors.length) {
        closeStory(); // Reached the end
      } else {
        openStory(currentStoryAuthorIndex);
      }
    } else {
      renderSlide();
    }
  }

  function reverseSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      renderSlide();
    } else if (currentStoryAuthorIndex > 0) {
      // Previous author
      openStory(currentStoryAuthorIndex - 1);
    }
  }

  function closeStory() {
    clearTimeout(slideTimer);
    storyModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.getElementById('closeStoryModal')?.addEventListener('click', closeStory);
  document.getElementById('storyTapRight')?.addEventListener('click', advanceSlide);
  document.getElementById('storyTapLeft')?.addEventListener('click', reverseSlide);
});


/* ==========================================================================
   PAGE SUGGESTION DROPDOWN
   Loads data/search-index.json once (lazy), then shows matching SEO page
   suggestions as the user types from 3+ characters. Clicking navigates
   directly to that collection page.
   ========================================================================== */
(function initPageSuggestions() {
  const searchInput       = document.getElementById('searchInput');
  const dropdown          = document.getElementById('pageSuggestionsDropdown');
  const list              = document.getElementById('suggestionsList');
  const countEl           = document.getElementById('suggestionsCount');

  const drawerInput       = document.getElementById('drawerSearchInput');
  const drawerDropdown    = document.getElementById('drawerSuggestionsDropdown');
  const drawerList        = document.getElementById('drawerSuggestionsList');
  const drawerCountEl     = document.getElementById('drawerSuggestionsCount');

  if (!searchInput && !drawerInput) return;

  const CAT_META = {
    'anniversary':               { label: 'Anniversary',          icon: 'fa-solid fa-cake-candles' },
    'attitude-savage':           { label: 'Attitude & Savage',    icon: 'fa-solid fa-fire' },
    'birthday':                  { label: 'Birthday',             icon: 'fa-solid fa-gift' },
    'breakup-heartbreak':        { label: 'Breakup',              icon: 'fa-solid fa-heart-crack' },
    'congratulations':           { label: 'Congratulations',      icon: 'fa-solid fa-trophy' },
    'daily-affirmations':        { label: 'Affirmations',         icon: 'fa-solid fa-sun' },
    'encouragement':             { label: 'Encouragement',        icon: 'fa-solid fa-hands-holding' },
    'family-bonds':              { label: 'Family',               icon: 'fa-solid fa-people-roof' },
    'fitness-workout':           { label: 'Fitness',              icon: 'fa-solid fa-dumbbell' },
    'food-cooking':              { label: 'Food & Cooking',       icon: 'fa-solid fa-utensils' },
    'friendship':                { label: 'Friendship',           icon: 'fa-solid fa-people-arrows' },
    'funny':                     { label: 'Funny',                icon: 'fa-solid fa-face-laugh-squint' },
    'good-morning':              { label: 'Good Morning',         icon: 'fa-solid fa-mug-hot' },
    'good-night':                { label: 'Good Night',           icon: 'fa-solid fa-moon' },
    'graduation':                { label: 'Graduation',           icon: 'fa-solid fa-graduation-cap' },
    'instagram-captions':        { label: 'Instagram Captions',   icon: 'fa-brands fa-instagram' },
    'leadership-business':       { label: 'Leadership',           icon: 'fa-solid fa-crown' },
    'linkedin-professional':     { label: 'LinkedIn / Pro',       icon: 'fa-brands fa-linkedin' },
    'love':                      { label: 'Love',                 icon: 'fa-solid fa-heart' },
    'mental-health':             { label: 'Mental Health',        icon: 'fa-solid fa-brain' },
    'motivation-hustle':         { label: 'Motivation',           icon: 'fa-solid fa-bolt-lightning' },
    'nature-travel':             { label: 'Nature & Travel',      icon: 'fa-solid fa-tree' },
    'new-year':                  { label: 'New Year',             icon: 'fa-solid fa-champagne-glasses' },
    'sad-emotional':             { label: 'Sad & Emotional',      icon: 'fa-solid fa-cloud-rain' },
    'self-growth-mental-health': { label: 'Self Growth',          icon: 'fa-solid fa-seedling' },
    'success-career':            { label: 'Success & Career',     icon: 'fa-solid fa-rocket' },
    'sympathy':                  { label: 'Sympathy',             icon: 'fa-solid fa-dove' },
    'thank-you':                 { label: 'Thank You',            icon: 'fa-regular fa-heart' },
    'tiktok-reels-quotes':       { label: 'TikTok / Reels',       icon: 'fa-brands fa-tiktok' },
    'travel-adventure':          { label: 'Travel & Adventure',   icon: 'fa-solid fa-compass' },
    'wedding':                   { label: 'Wedding',              icon: 'fa-solid fa-ring' },
    'whatsapp-status':           { label: 'WhatsApp Status',      icon: 'fa-brands fa-whatsapp' },
    'writing-literature':        { label: 'Writing & Literature', icon: 'fa-solid fa-feather-pointed' },
    'author':                    { label: 'Author',               icon: 'fa-solid fa-user-pen' },
  };
  const DEFAULT_ICON = 'fa-solid fa-quote-left';

  let searchIndex = null;
  let keyboardIdx = -1;

  async function ensureIndexLoaded() {
    if (searchIndex) return;
    try {
      const res = await fetch('data/search-index.json');
      if (!res.ok) throw new Error('not found');
      searchIndex = await res.json();
    } catch (e) {
      console.warn('Page suggestion index unavailable:', e);
      searchIndex = [];
    }
  }

  function highlight(text, query) {
    if (!query) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${safe})`, 'gi'), '<mark>$1</mark>');
  }

  function matchesQuery(item, query) {
    const hay = (item.title + ' ' + item.keywords.join(' ') + ' ' + item.category).toLowerCase();
    return query.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w));
  }

  function renderSuggestionsFor(query, targetList, targetDropdown, targetCountEl) {
    if (!targetList || !targetDropdown) return;
    if (!query || query.length < 3) {
      targetDropdown.classList.remove('visible');
      return;
    }

    const matches = searchIndex.filter(item => matchesQuery(item, query)).slice(0, 10);
    keyboardIdx = -1;

    if (matches.length === 0) {
      targetList.innerHTML = `<div class="suggestions-no-results">
        <i class="fa-solid fa-face-sad-tear"></i>
        No collections found for "<strong>${query}</strong>"
      </div>`;
    } else {
      const catMeta = item => CAT_META[item.category] || { label: item.category.replace(/-/g, ' '), icon: DEFAULT_ICON };
      targetList.innerHTML = matches.map((item, i) => {
        const meta = catMeta(item);
        const safeTitle = highlight(item.title, query);
        return `<li>
          <a class="suggestion-item" href="${item.path}" data-idx="${i}" role="option" aria-selected="false">
            <div class="suggestion-icon"><i class="${meta.icon}"></i></div>
            <div class="suggestion-text">
              <div class="suggestion-title">${safeTitle}</div>
              <div class="suggestion-meta"><i class="fa-solid fa-folder-open" style="font-size:0.65rem;margin-right:3px;"></i>${meta.label}</div>
            </div>
            <i class="fa-solid fa-arrow-right suggestion-arrow"></i>
          </a>
        </li>`;
      }).join('');
    }

    if (targetCountEl) {
      targetCountEl.textContent = matches.length > 0
        ? `${matches.length} collection${matches.length > 1 ? 's' : ''} found`
        : '';
    }

    targetDropdown.classList.add('visible');
  }

  function hideSuggestions() {
    if (dropdown) dropdown.classList.remove('visible');
    if (drawerDropdown) drawerDropdown.classList.remove('visible');
    keyboardIdx = -1;
  }

  window.hideSuggestionsGlobal = hideSuggestions;

  function navigateKeyboard(dir, targetList) {
    if (!targetList) return;
    const items = targetList.querySelectorAll('.suggestion-item');
    if (!items.length) return;
    items[keyboardIdx]?.classList.remove('keyboard-active');
    keyboardIdx = (keyboardIdx + dir + items.length) % items.length;
    const active = items[keyboardIdx];
    active.classList.add('keyboard-active');
    active.scrollIntoView({ block: 'nearest' });
  }

  // Bind Main Search Input
  if (searchInput && dropdown && list) {
    searchInput.addEventListener('focus', async () => {
      await ensureIndexLoaded();
      if (searchInput.value.trim().length >= 3) renderSuggestionsFor(searchInput.value.trim(), list, dropdown, countEl);
    });

    searchInput.addEventListener('input', async () => {
      await ensureIndexLoaded();
      renderSuggestionsFor(searchInput.value.trim(), list, dropdown, countEl);
    });

    searchInput.addEventListener('keydown', (e) => {
      const visible = dropdown.classList.contains('visible');
      if (!visible) return;
      if (e.key === 'ArrowDown')  { e.preventDefault(); navigateKeyboard(+1, list); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); navigateKeyboard(-1, list); }
      if (e.key === 'Escape')     { hideSuggestions(); }
      if (e.key === 'Enter') {
        const active = list.querySelector('.keyboard-active');
        if (active) { e.preventDefault(); window.location.href = active.getAttribute('href'); }
      }
    });
  }

  // Bind Drawer Search Input
  if (drawerInput && drawerDropdown && drawerList) {
    drawerInput.addEventListener('focus', async () => {
      await ensureIndexLoaded();
      if (drawerInput.value.trim().length >= 3) renderSuggestionsFor(drawerInput.value.trim(), drawerList, drawerDropdown, drawerCountEl);
    });

    drawerInput.addEventListener('input', async () => {
      await ensureIndexLoaded();
      renderSuggestionsFor(drawerInput.value.trim(), drawerList, drawerDropdown, drawerCountEl);
    });

    drawerInput.addEventListener('keydown', (e) => {
      const visible = drawerDropdown.classList.contains('visible');
      if (!visible) return;
      if (e.key === 'ArrowDown')  { e.preventDefault(); navigateKeyboard(+1, drawerList); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); navigateKeyboard(-1, drawerList); }
      if (e.key === 'Escape')     { hideSuggestions(); }
      if (e.key === 'Enter') {
        const active = drawerList.querySelector('.keyboard-active');
        if (active) { e.preventDefault(); window.location.href = active.getAttribute('href'); }
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchWrapper') &&
        !e.target.closest('#pageSuggestionsDropdown') &&
        !e.target.closest('#drawerSearchWrapper') &&
        !e.target.closest('#drawerSuggestionsDropdown')) {
      hideSuggestions();
    }
  });

  document.getElementById('clearSearchBtn')?.addEventListener('click', hideSuggestions);
})();