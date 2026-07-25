$files = Get-ChildItem -Path "quotes" -Filter "*.html" -Recurse

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $matches = [regex]::Matches($content, 'class="card-quote-text">"([^"]*)"')
    
    $quotes = [System.Collections.Generic.List[string]]::new()
    foreach ($m in $matches) {
        $quotes.Add($m.Groups[1].Value)
    }
    
    if ($quotes.Count -gt 0) {
        $unique = $quotes | Select-Object -Unique
        if ($quotes.Count -ne $unique.Count) {
            Write-Host "DUPLICATES IN $($f.FullName): Total $($quotes.Count), Unique $($unique.Count)"
        }
    }
}

Write-Host "Check complete."
