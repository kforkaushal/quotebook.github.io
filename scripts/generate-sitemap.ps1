$domain = "https://quotebook.me"
$today = (Get-Date).ToString("yyyy-MM-dd")
$baseDir = "c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"

$xmlLines = [System.Collections.Generic.List[string]]::new()
$xmlLines.Add('<?xml version="1.0" encoding="UTF-8"?>')
$xmlLines.Add('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

function Get-Priority ($relPath) {
    if ($relPath -eq "index.html") { return "1.0", "daily" }
    if ($relPath -eq "quotes.html") { return "0.9", "daily" }
    if ($relPath -eq "poster.html") { return "0.8", "weekly" }
    if ($relPath -eq "404.html") { return "0.3", "monthly" }
    if ($relPath -like "quotes/*") { return "0.7", "weekly" }
    if ($relPath -like "authors/*") { return "0.6", "monthly" }
    return "0.5", "weekly"
}

$files = Get-ChildItem -Path $baseDir -Recurse -Filter *.html | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\'
} | Sort-Object FullName

foreach ($file in $files) {
    $rel = $file.FullName.Substring($baseDir.Length).TrimStart('\', '/').Replace('\', '/')
    while ($rel.Contains("//")) { $rel = $rel.Replace("//", "/") }
    
    $prio, $freq = Get-Priority $rel

    if ($rel -eq "index.html") {
        $cleanUrl = "$domain/"
    } else {
        $cleanPath = $rel -replace '\.html$', ''
        $cleanUrl = "$domain/$cleanPath"
    }

    $xmlLines.Add("  <url>")
    $xmlLines.Add("    <loc>$cleanUrl</loc>")
    $xmlLines.Add("    <lastmod>$today</lastmod>")
    $xmlLines.Add("    <changefreq>$freq</changefreq>")
    $xmlLines.Add("    <priority>$prio</priority>")
    $xmlLines.Add("  </url>")
}

$xmlLines.Add('</urlset>')

$outPath = Join-Path $baseDir "sitemap.xml"
[System.IO.File]::WriteAllLines($outPath, $xmlLines, [System.Text.Encoding]::UTF8)
Write-Host "Sitemap successfully regenerated with $($files.Count) clean URLs!"
