$targetDir = "c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"

$gaSnippet = @"
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P7WSN8P37J"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-P7WSN8P37J');
  </script>
"@

$filesChanged = 0
$files = Get-ChildItem -Path $targetDir -Recurse -Filter *.html | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\'
}

foreach ($file in $files) {
    $txt = [System.IO.File]::ReadAllText($file.FullName)
    if ([string]::IsNullOrEmpty($txt)) { continue }
    if ($txt.Contains("G-P7WSN8P37J")) { continue }

    $before = $txt

    if ($txt -match '(?i)<meta\s+charset=["'']?UTF-8["'']?\s*\/?>') {
        $txt = [regex]::Replace($txt, '(?i)(<meta\s+charset=["'']?UTF-8["'']?\s*\/?>)', "`$1`n$gaSnippet")
    } elseif ($txt.Contains("<head>")) {
        $txt = $txt.Replace("<head>", "<head>`n$gaSnippet")
    }

    if ($txt -ne $before) {
        [System.IO.File]::WriteAllText($file.FullName, $txt)
        $filesChanged++
        Write-Host "Injected GA into: $($file.FullName)"
    }
}

Write-Host "`nDone. Injected Google Analytics into $filesChanged files."
