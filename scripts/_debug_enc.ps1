$bytes = [IO.File]::ReadAllBytes('data/quotes_8000_plus.json')
$utf8 = [Text.Encoding]::UTF8
$text = $utf8.GetString($bytes)
$idx2 = $text.IndexOf([char]0x00e2)
if ($idx2 -ge 0) {
    Write-Host "Found raw 0xE2 char at $idx2"
    $snippet = $text.Substring([Math]::Max(0,$idx2-2), 10)
    foreach ($c in $snippet.ToCharArray()) {
        Write-Host ([int][char]$c).ToString('X4') $c
    }
} else {
    Write-Host "No mojibake found - quotes_8000_plus appears clean"
}
