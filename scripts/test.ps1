$dataObj = Get-Content "data\quotes_enriched.json" | ConvertFrom-Json
$count = 0
foreach ($catProp in $dataObj.categories.psobject.properties) {
    if ($catProp.Value.subcategories) {
        foreach ($subProp in $catProp.Value.subcategories.psobject.properties) {
            $catName = $catProp.Name
            $subName = $subProp.Name
            $slug = "$($catName.ToLower() -replace '_', '-')-$($subName.ToLower() -replace '_', '-')"
            Write-Host "enriched: $slug"
            $count++
        }
    }
}
Write-Host "enriched count: $count"
