$ErrorActionPreference = "Stop"

$quotesDir = Join-Path $PSScriptRoot "..\quotes"
$files = Get-ChildItem -Path $quotesDir -Filter "*.html"

$newFooter = @"
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
          <span class="logo-title">Quotebook</span>
        </div>
        <p>A modern editorial web application for discovering quotes, listening aloud, and generating canvas posters with Pixabay photography.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Navigation</h4>
          <a href="../index.html">Home</a>
          <a href="../quotes.html">Quotes Library</a>
          <a href="../quotes.html?action=poster">Poster Studio</a>
          <a href="../index.html#features">Features</a>
        </div>
        <div class="footer-col">
          <h4>Categories</h4>
          <a href="../quotes.html?category=Wisdom+%26+Knowledge">Wisdom</a>
          <a href="../quotes.html?category=Philosophy+%26+Thinking">Philosophy</a>
          <a href="../quotes.html?category=Books+%26+Reading">Books</a>
          <a href="../quotes.html?category=Motivation+%26+Inspiration">Motivation</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Quotebook. Powered by Pixabay API & Open Quote Datasets.</p>
    </div>
  </footer>
"@

$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Check if the new footer is already present
    if ($content -match 'class="footer-links"') {
        # Already has the new footer links, maybe it's fine, but let's replace anyway to ensure consistency
    }
    
    # Regex to match the entire footer block
    # (?s) makes . match newlines
    if ($content -match '(?s)<footer class="app-footer">.*?</footer>') {
        $content = $content -replace '(?s)<footer class="app-footer">.*?</footer>', $newFooter
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $fixedCount++
    }
}

Write-Host "Successfully repaired footer in $fixedCount pages."
