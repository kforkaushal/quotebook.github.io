$ErrorActionPreference = "Stop"

Write-Host "Reading quotes_8000_plus.json..."
$inputFile = Join-Path $PSScriptRoot "..\data\quotes_8000_plus.json"
$dataset = Get-Content $inputFile | ConvertFrom-Json

$allSearchData = [System.Collections.Generic.List[hashtable]]::new()
$uniqueQuotes = @{}

foreach ($catProp in $dataset.categories.psobject.properties) {
    $catName = $catProp.Name
    if ($catProp.Value.quotes) {
        foreach ($q in $catProp.Value.quotes) {
            $qText = ""
            $qAuthor = "Unknown"
            if ($q -is [string]) {
                $qText = $q
            } else {
                $qText = $q.quote
                if ($q.author) { $qAuthor = $q.author }
            }
            
            if (![string]::IsNullOrWhiteSpace($qText)) {
                $hash = $qText.Trim().ToLower()
                if (-not $uniqueQuotes.ContainsKey($hash)) {
                    $uniqueQuotes[$hash] = $true
                    
                    $allSearchData.Add(@{
                        q = $qText
                        a = $qAuthor
                        c = $catName
                    })
                }
            }
        }
    }
}

Write-Host "Total unique quotes for search index: $($allSearchData.Count)"

$outPath = Join-Path $PSScriptRoot "..\data\search_index.json"
$allSearchData | ConvertTo-Json -Compress | Out-File -FilePath $outPath -Encoding UTF8

Write-Host "Saved search index to $outPath"
