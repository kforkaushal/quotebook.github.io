$baseDir = "c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"

$files = Get-ChildItem -Path $baseDir -Recurse -Filter *.html | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\'
}

$fixedCount = 0

foreach ($file in $files) {
    $txt = [System.IO.File]::ReadAllText($file.FullName)
    if ([string]::IsNullOrEmpty($txt)) { continue }

    # Find how many times Google tag appears
    $matches = [regex]::Matches($txt, '<!-- Google tag \(gtag\.js\) -->[\s\S]*?gtag\(''config'', ''G-P7WSN8P37J''\);[\s\S]*?<\/script>')
    if ($matches.Count -gt 1) {
        # Keep only the first match right after <head> and remove remaining matches
        $firstMatch = $matches[0].Value
        for ($i = 1; $i -lt $matches.Count; $i++) {
            $txt = $txt.Replace($matches[$i].Value, '')
        }
        [System.IO.File]::WriteAllText($file.FullName, $txt, [System.Text.Encoding]::UTF8)
        $fixedCount++
    }
}

Write-Host "Deduplicated Google Analytics tags across $fixedCount HTML files!"
