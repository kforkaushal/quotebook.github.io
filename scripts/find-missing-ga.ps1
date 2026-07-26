$baseDir = "c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"
$files = Get-ChildItem -Path $baseDir -Recurse -Filter *.html | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\'
}

$missing = [System.Collections.Generic.List[string]]::new()

foreach ($file in $files) {
    $txt = [System.IO.File]::ReadAllText($file.FullName)
    if (-not $txt.Contains("G-P7WSN8P37J")) {
        $missing.Add($file.FullName)
    }
}

Write-Host "Total files checked: $($files.Count)"
Write-Host "Total files missing GA tag: $($missing.Count)"
foreach ($m in $missing) {
    Write-Host "MISSING GA: $m"
}
