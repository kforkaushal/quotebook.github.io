$ErrorActionPreference = "Stop"

$dataDir = Join-Path $PSScriptRoot "..\data"
$inputFile = Join-Path $dataDir "quotes_8000_plus.json"
$categoryDir = Join-Path $dataDir "category_quotes"

if (-not (Test-Path $inputFile)) {
    Write-Error "Input file not found: $inputFile"
    exit 1
}

if (-not (Test-Path $categoryDir)) {
    New-Item -ItemType Directory -Force -Path $categoryDir | Out-Null
}

Write-Host "Reading 55MB JSON file (this might take a minute)..."
$rawData = Get-Content $inputFile -Raw
$dataObj = ConvertFrom-Json $rawData

$metadata = @{ categories = @{} }

Write-Host "Chunking data..."
foreach ($prop in $dataObj.categories.psobject.properties) {
    $catName = $prop.Name
    $catObj = $prop.Value
    if ($catObj.quotes -and $catObj.quotes.Count -gt 0) {
        $catSlug = $catName.ToLower() -replace '[^a-z0-9]+', '-'
        $catFile = Join-Path $categoryDir "$catSlug.json"
        
        $outObj = @{
            category = $catName
            quotes = $catObj.quotes
        }
        
        $outObj | ConvertTo-Json -Depth 5 -Compress | Set-Content -Path $catFile -Encoding UTF8
        
        $metadata.categories[$catName] = @{
            count = $catObj.quotes.Count
            file = "data/category_quotes/$catSlug.json"
        }
    }
}

$metaFile = Join-Path $dataDir "metadata.json"
$metadata | ConvertTo-Json -Depth 5 | Set-Content -Path $metaFile -Encoding UTF8

Write-Host "Successfully generated metadata and category chunks."
