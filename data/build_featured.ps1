$jsonPath = "data\quotes_8000_plus.json"
$outPath = "data\featured_quotes.json"

Write-Host "Reading $jsonPath..."
$raw = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json

$featuredCategories = [ordered]@{}

foreach ($prop in $raw.categories.psobject.properties) {
    $catName = $prop.Name
    $catData = $prop.Value
    
    # Grab top 15 quotes sorted by popularity per category
    $sortedQuotes = $catData.quotes | Sort-Object popularity -Descending | Select-Object -First 15
    
    $featuredCategories[$catName] = @{
        count = $catData.count
        quotes = $sortedQuotes
    }
}

$outputData = [ordered]@{
    metadata = $raw.metadata
    categories = $featuredCategories
}

Write-Host "Writing $outPath..."
$outputData | ConvertTo-Json -Depth 10 | Set-Content -Path $outPath -Encoding UTF8
Write-Host "Featured dataset generated successfully!"
