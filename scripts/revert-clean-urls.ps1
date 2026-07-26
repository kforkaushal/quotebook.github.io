$targetDir = "c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"

$filesChanged = 0
$files = Get-ChildItem -Path $targetDir -Recurse -Include *.html,*.js,*.xml,*.json | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\'
}

foreach ($file in $files) {
    $txt = [System.IO.File]::ReadAllText($file.FullName)
    if ([string]::IsNullOrEmpty($txt)) { continue }
    $before = $txt

    # Revert href="quotes" or href="poster" or href="index"
    $txt = $txt -replace 'href="quotes"', 'href="quotes.html"'
    $txt = $txt -replace 'href="poster"', 'href="poster.html"'
    $txt = $txt -replace 'href="index"', 'href="index.html"'
    $txt = $txt -replace 'href="\.\./quotes"', 'href="../quotes.html"'
    $txt = $txt -replace 'href="\.\./poster"', 'href="../poster.html"'
    $txt = $txt -replace 'href="\.\./index"', 'href="../index.html"'
    $txt = $txt -replace 'href="\.\./\.\./quotes"', 'href="../../quotes.html"'

    # Revert href with queries
    $txt = $txt -replace 'href="quotes\?', 'href="quotes.html?'
    $txt = $txt -replace 'href="\.\./quotes\?', 'href="../quotes.html?'
    $txt = $txt -replace 'href="\.\./\.\./quotes\?', 'href="../../quotes.html?'

    # Revert canonicals
    $txt = $txt -replace 'href="https://quotebook\.me/quotes"', 'href="https://quotebook.me/quotes.html"'
    $txt = $txt -replace 'href="https://quotebook\.me/poster"', 'href="https://quotebook.me/poster.html"'
    $txt = $txt -replace 'href="https://quotebook\.me/index"', 'href="https://quotebook.me/index.html"'

    # Revert og:url
    $txt = $txt -replace 'content="https://quotebook\.me/quotes"', 'content="https://quotebook.me/quotes.html"'
    $txt = $txt -replace 'content="https://quotebook\.me/poster"', 'content="https://quotebook.me/poster.html"'
    $txt = $txt -replace 'content="https://quotebook\.me/index"', 'content="https://quotebook.me/index.html"'

    if ($txt -ne $before) {
        [System.IO.File]::WriteAllText($file.FullName, $txt)
        $filesChanged++
        Write-Host "Reverted: $($file.FullName)"
    }
}

Write-Host "`nDone. $filesChanged files reverted."
