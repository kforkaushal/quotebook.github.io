$targetDir = "c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"

$filesChanged = 0
$files = Get-ChildItem -Path $targetDir -Recurse -Include *.html,*.js,*.xml,*.json | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\'
}

foreach ($file in $files) {
    $txt = Get-Content $file.FullName -Raw
    if ($null -eq $txt) { continue }
    $before = $txt

    # 1. href="...html" (skip external URLs with ://)
    $txt = [regex]::Replace($txt, '(href=["''])([^"''\s:]+?)\.html(["''#?])', '$1$2$3')
    # 2. <loc>...html</loc>
    $txt = [regex]::Replace($txt, '(<loc>)([^<]+?)\.html(</loc>)', '$1$2$3')
    # 3. window.location = "...html"
    $txt = [regex]::Replace($txt, '(window\.location(?:\.href)?\s*=\s*["''])([^"''\s:]+?)\.html', '$1$2')
    # 4. canonical href="...html"
    $txt = [regex]::Replace($txt, '(canonical["''\s:]*href=["''])([^"''\s:]+?)\.html(["''])', '$1$2$3')

    if ($txt -ne $before) {
        Set-Content -Path $file.FullName -Value $txt -NoNewline
        $filesChanged++
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nDone. $filesChanged files updated."
