# generate-search-index.ps1
# Builds data/search-index.json from all SEO HTML files in the quotes/ folder
# Each entry: { title, path, category, keywords[] }

$quotesDir = "quotes"
$outputPath = "data/search-index.json"

Write-Host "Scanning SEO pages..."

$index = [System.Collections.Generic.List[PSObject]]::new()

$files = Get-ChildItem -Path $quotesDir -Filter "*.html" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Extract <title>
    $titleMatch = [regex]::Match($content, '<title>([^<]+)</title>')
    if (-not $titleMatch.Success) { continue }
    $title = $titleMatch.Groups[1].Value.Trim()
    
    # Remove common suffix noise like "(2026)" and "- Quotebook"  
    $cleanTitle = $title -replace '\s*\(\d{4}\)\s*', '' -replace '\s*-\s*Quotebook\s*', '' -replace '^\d+\+\s*', ''
    $cleanTitle = $cleanTitle.Trim()
    
    # Build relative path from workspace root
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    
    # Derive category from folder name
    $category = $file.Directory.Name
    
    # Build keyword array from slug words
    $slug = $file.BaseName
    $keywords = $slug -split '-' | Where-Object { $_.Length -gt 2 }
    
    $entry = [PSCustomObject]@{
        title    = $cleanTitle
        path     = $relativePath
        category = $category
        keywords = $keywords
    }
    
    $index.Add($entry)
}

$indexJson = $index | ConvertTo-Json -Depth 3 -Compress
[System.IO.File]::WriteAllText($outputPath, $indexJson, [System.Text.Encoding]::UTF8)

Write-Host "Generated search index with $($index.Count) entries -> $outputPath"
