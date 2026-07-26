# patch-all-search.ps1 — Apply search fixes + add suggestion module to app.js
$file = "src/js/app.js"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# ─────────────────────────────────────────────────────────────
# FIX 1: Decouple live typing from grid re-render
# ─────────────────────────────────────────────────────────────
$old1 = '  if (searchInput && clearBtn) {
    searchInput.addEventListener(''input'', (e) => {
      state.searchQuery = e.target.value.trim();
      clearBtn.classList.toggle(''active'', state.searchQuery.length > 0);
      state.currentPage = 1;
      applyFilters();
    });

    clearBtn.addEventListener(''click'', () => {
      searchInput.value = '''';
      state.searchQuery = '''';
      clearBtn.classList.remove(''active'');
      state.currentPage = 1;
      applyFilters();
    });
  }'

$new1 = '  if (searchInput && clearBtn) {
    // Typing only buffers the query — grid stays frozen until Enter
    searchInput.addEventListener(''input'', (e) => {
      state.searchQuery = e.target.value.trim();
      clearBtn.classList.toggle(''active'', state.searchQuery.length > 0);
      // Grid stays stable — DO NOT call applyFilters() here
    });

    // Enter = commit search and update the grid
    searchInput.addEventListener(''keydown'', (e) => {
      if (e.key === ''Enter'') {
        const activeSuggestion = document.querySelector(''.suggestion-item.keyboard-active'');
        if (activeSuggestion) return; // suggestion engine handles navigation
        if (typeof window.hideSuggestionsGlobal === ''function'') window.hideSuggestionsGlobal();
        state.currentPage = 1;
        applyFilters();
      }
    });

    clearBtn.addEventListener(''click'', () => {
      searchInput.value = '''';
      state.searchQuery = '''';
      clearBtn.classList.remove(''active'');
      state.currentPage = 1;
      applyFilters(); // clearing = immediate grid reset
    });
  }'

if ($content.Contains($old1)) {
    $content = $content.Replace($old1, $new1)
    Write-Host "✓ FIX 1 applied: grid frozen until Enter"
} else {
    Write-Host "✗ FIX 1 pattern NOT found — check whitespace"
}

# ─────────────────────────────────────────────────────────────
# FIX 2+3: Append entire suggestion module at the end
# ─────────────────────────────────────────────────────────────
$suggestionModule = @'


/* ==========================================================================
   PAGE SUGGESTION DROPDOWN
   Loads data/search-index.json once (lazy), then shows matching SEO page
   suggestions as the user types from 3+ characters. Clicking navigates
   directly to that collection page.
   ========================================================================== */
(function initPageSuggestions() {
  const searchInput = document.getElementById('searchInput');
  const dropdown    = document.getElementById('pageSuggestionsDropdown');
  const list        = document.getElementById('suggestionsList');
  const countEl     = document.getElementById('suggestionsCount');
  if (!searchInput || !dropdown || !list) return;

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

  function renderSuggestions(query) {
    if (!query || query.length < 3) { hideSuggestions(); return; }

    const matches = searchIndex.filter(item => matchesQuery(item, query)).slice(0, 10);
    keyboardIdx = -1;

    if (matches.length === 0) {
      list.innerHTML = `<div class="suggestions-no-results">
        <i class="fa-solid fa-face-sad-tear"></i>
        No collections found for "<strong>${query}</strong>"
      </div>`;
    } else {
      const catMeta = item => CAT_META[item.category] || { label: item.category.replace(/-/g, ' '), icon: DEFAULT_ICON };
      list.innerHTML = matches.map((item, i) => {
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

    if (countEl) {
      countEl.textContent = matches.length > 0
        ? `${matches.length} collection${matches.length > 1 ? 's' : ''} found · ↑↓ navigate · Enter to open`
        : '';
    }

    dropdown.classList.add('visible');
  }

  function hideSuggestions() {
    dropdown.classList.remove('visible');
    keyboardIdx = -1;
  }

  // Expose globally so the main search Enter handler can call it
  window.hideSuggestionsGlobal = hideSuggestions;

  function navigateKeyboard(dir) {
    const items = list.querySelectorAll('.suggestion-item');
    if (!items.length) return;
    items[keyboardIdx]?.classList.remove('keyboard-active');
    keyboardIdx = (keyboardIdx + dir + items.length) % items.length;
    const active = items[keyboardIdx];
    active.classList.add('keyboard-active');
    active.scrollIntoView({ block: 'nearest' });
  }

  searchInput.addEventListener('focus', async () => {
    await ensureIndexLoaded();
    if (searchInput.value.trim().length >= 3) renderSuggestions(searchInput.value.trim());
  });

  // No debounce — index is always in-memory after first focus, lookups are instant
  searchInput.addEventListener('input', async () => {
    await ensureIndexLoaded();
    renderSuggestions(searchInput.value.trim());
  });

  searchInput.addEventListener('keydown', (e) => {
    const visible = dropdown.classList.contains('visible');
    if (!visible) return;
    if (e.key === 'ArrowDown')  { e.preventDefault(); navigateKeyboard(+1); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); navigateKeyboard(-1); }
    if (e.key === 'Escape')     { hideSuggestions(); }
    if (e.key === 'Enter') {
      const active = list.querySelector('.keyboard-active');
      if (active) { e.preventDefault(); window.location.href = active.getAttribute('href'); }
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchWrapper') && !e.target.closest('#pageSuggestionsDropdown')) {
      hideSuggestions();
    }
  });

  document.getElementById('clearSearchBtn')?.addEventListener('click', hideSuggestions);
})();
'@

# Only append if the module isn't already there
if (-not $content.Contains('initPageSuggestions')) {
    $content = $content + $suggestionModule
    Write-Host "✓ FIX 2+3 applied: suggestion module appended"
} else {
    Write-Host "✓ FIX 2+3: suggestion module already present, skipping"
}

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done. $file patched successfully."
