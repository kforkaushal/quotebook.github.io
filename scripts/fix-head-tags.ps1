$targetDir = "c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"

$filesChanged = 0
$files = Get-ChildItem -Path $targetDir -Recurse -Filter *.html | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\'
}

foreach ($file in $files) {
    $txt = [System.IO.File]::ReadAllText($file.FullName)
    if ([string]::IsNullOrEmpty($txt)) { continue }
    $before = $txt

    # Replace <head> that was mistakenly used instead of <header class="app-header"> before <div class="header-container">
    $txt = [regex]::Replace($txt, '<head>(\s*<div class="header-container">)', '<header class="app-header">$1')

    if ($txt -ne $before) {
        [System.IO.File]::WriteAllText($file.FullName, $txt)
        $filesChanged++
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nDone. $filesChanged files updated."
