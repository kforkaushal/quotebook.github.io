$ErrorActionPreference = "Stop"
$quotesFiles = Get-ChildItem -Path $PSScriptRoot\..\quotes\*.html

$count = 0
foreach ($file in $quotesFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Check if this file has the old header actions
    if ($content -match '<div class="header-actions" id="headerActions">[\s\S]*?</div>') {
        $oldHeader = $matches[0]
        
        # We replace the whole block with the new clean block
        $newHeader = @"
<div class="header-actions" id="headerActions">
        <button class="icon-btn mobile-search-trigger-btn" id="mobileSearchTrigger" title="Search Quotes">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
        <button class="icon-btn lite-mode-toggle-btn" id="toggleDataSaver" title="Toggle Lite Mode (Saves Internet)">
          <i class="fa-solid fa-leaf"></i>
        </button>
        <a href="../index.html" class="icon-btn" title="Home">
          <i class="fa-solid fa-house"></i>
        </a>
        <button class="icon-btn" id="btnRandomQuote" title="Random Quote">
          <i class="fa-solid fa-shuffle"></i>
        </button>
        <a href="../poster.html" class="icon-btn" title="Poster Studio">
          <i class="fa-solid fa-palette"></i>
        </a>
        <button class="icon-btn" id="btnZenMode" title="Zen Mode">
          <i class="fa-solid fa-expand"></i>
        </button>
        <button class="icon-btn highlight" id="btnOpenBookmarks" title="Saved Quotes" style="position: relative;">
          <i class="fa-solid fa-bookmark"></i>
          <span class="badge" id="bookmarkCount" style="position: absolute; top: -6px; right: -6px;">0</span>
        </button>
      </div>
"@
        
        $content = $content.Replace($oldHeader, $newHeader)
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $count++
    }
}

Write-Host "Updated UI UX nav bar in $count generated files."
