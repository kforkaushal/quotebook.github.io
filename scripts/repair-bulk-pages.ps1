$ErrorActionPreference = "Stop"

$quotesDir = Join-Path $PSScriptRoot "..\quotes"
$files = Get-ChildItem -Path $quotesDir -Filter "*.html"

Write-Host "Found $($files.Count) HTML files in quotes directory."

$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # 1. Replace placeholder domain
    if ($content -match "quotebook\.example\.com") {
        $content = $content -replace "quotebook\.example\.com", "quotebook.me"
        $modified = $true
    }
    
    # 2. Remove card-actions block completely
    # The regex matches <div class="card-actions"> ... </div> (including newlines)
    if ($content -match '<div class="card-actions">') {
        # Use regex to remove the card-actions div and its contents
        $content = $content -replace '(?s)<div class="card-actions">.*?</div>', ''
        $modified = $true
    }
    
    if ($modified) {
        # Save back without BOM (using UTF8NoBOM in PS Core or [IO.File]::WriteAllText)
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $fixedCount++
    }
}

# Also do index.html and quotes.html for the domain
foreach ($f in @("..\index.html", "..\quotes.html")) {
    $fullPath = Join-Path $PSScriptRoot $f
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        if ($content -match "quotebook\.example\.com") {
            $content = $content -replace "quotebook\.example\.com", "quotebook.me"
            [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
            Write-Host "Fixed domain in $($f)"
        }
    }
}

Write-Host "Successfully repaired $fixedCount pages."
