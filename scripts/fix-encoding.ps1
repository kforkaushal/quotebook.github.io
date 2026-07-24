# Fix mojibake encoding symbols in all JSON data files
$dataDir = "data"
$files = Get-ChildItem -Path $dataDir -Filter "*.json" -Recurse

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $original = $content

    # em-dash
    $content = $content -replace [regex]::Escape('â€"'), [char]0x2014
    # en-dash
    $content = $content -replace [regex]::Escape('â€"'), [char]0x2013
    # ellipsis
    $content = $content -replace [regex]::Escape('â€¦'), [char]0x2026
    # left single quote
    $content = $content -replace [regex]::Escape('â€˜'), [char]0x2018
    # right single quote
    $content = $content -replace [regex]::Escape('â€™'), [char]0x2019
    # left double quote
    $content = $content -replace [regex]::Escape('â€œ'), [char]0x201C

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "Fixed: $($f.Name)"
    } else {
        Write-Host "No change: $($f.Name)"
    }
}
Write-Host "Done."
