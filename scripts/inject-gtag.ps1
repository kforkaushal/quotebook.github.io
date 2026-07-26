$baseDir = "c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"

$gtagCode = @"
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-P7WSN8P37J"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-P7WSN8P37J');
</script>
"@

$files = Get-ChildItem -Path $baseDir -Recurse -Filter *.html | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\'
}

$updatedCount = 0

foreach ($file in $files) {
    $txt = [System.IO.File]::ReadAllText($file.FullName)
    if ([string]::IsNullOrEmpty($txt)) { continue }

    # Check if gtag is already present to prevent duplicate insertion
    if ($txt -match 'G-P7WSN8P37J') {
        continue
    }

    # Inject immediately after <head> or <head ...>
    if ($txt -match '(?i)<head[^>]*>') {
        $headTag = $Matches[0]
        $replacement = "$headTag`n$gtagCode"
        $newTxt = [regex]::Replace($txt, '(?i)<head[^>]*>', $replacement, [System.Text.RegularExpressions.RegexOptions]::None, 1)

        [System.IO.File]::WriteAllText($file.FullName, $newTxt, [System.Text.Encoding]::UTF8)
        $updatedCount++
    }
}

Write-Host "Google Analytics Tag successfully injected into $updatedCount HTML pages!"
