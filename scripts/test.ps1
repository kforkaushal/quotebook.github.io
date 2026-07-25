$c = Get-Content data/quotes_collection.json | ConvertFrom-Json
$props = $c.psobject.properties
Write-Host "Top level keys:"
foreach ($p in $props) {
    Write-Host "- $($p.Name)"
}
$firstKey = $props[0].Name
$firstSubkeys = $c.$firstKey.subcategories.psobject.properties
Write-Host "Subkeys of ${firstKey}:"
foreach ($s in $firstSubkeys) {
    Write-Host "- $($s.Name) ($($s.Value.GetType()))"
    Write-Host "IsArray: $($s.Value -is [array])"
    
    # Try array casting
    $arr = @($s.Value)
    Write-Host "Arr Count: $($arr.Count)"
    
    $sorted = $arr | Sort-Object -Unique -Property quote
    $sortedArr = @($sorted)
    Write-Host "Sorted Arr Count: $($sortedArr.Count)"
}
