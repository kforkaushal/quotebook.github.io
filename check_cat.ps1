$meta = Get-Content "data/metadata.json" -Raw | ConvertFrom-Json
$meta.categories.PSObject.Properties | Select-Object -ExpandProperty Name | Select-String -Pattern "Birthday|Funny"
