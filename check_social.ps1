$soc = Get-Content "data/social_media_quotes.json" -Raw | ConvertFrom-Json
$soc.categories.PSObject.Properties | Select-Object -ExpandProperty Name | Select-Object -First 10
