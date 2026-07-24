# Fix mojibake in JSON files.
# The files were saved as UTF-8 but the browser (or the source tool) re-interpreted
# those UTF-8 bytes as Windows-1252, turning e.g. the em-dash (E2 80 94) into â€"
#
# When PowerShell reads the resulting mis-encoded file as UTF-8, each Windows-1252
# byte is mapped to its Unicode equivalents:
#   0xE2 -> U+00E2 (â), 0x80 -> U+20AC (€), then:
#   0x94 -> U+201D ("), 0x93 -> U+201C ("), 0xA6 -> U+00A6 (¦),
#   0x98 -> U+02DC (~), 0x99 -> U+2122 (™), 0x9C -> U+0153 (œ)
#
#  Note: Windows-1252 0x80-0x9F map to specific Unicode characters (not C1 controls)

$utf8 = [System.Text.Encoding]::UTF8
$files = Get-ChildItem -Path data -Filter *.json -Recurse
$fixedCount = 0

$map = [ordered]@{
    ([string][char]0x00E2 + [char]0x20AC + [char]0x201D) = [string][char]0x2014   # em-dash U+2014
    ([string][char]0x00E2 + [char]0x20AC + [char]0x201C) = [string][char]0x2013   # en-dash U+2013
    ([string][char]0x00E2 + [char]0x20AC + [char]0x00A6) = [string][char]0x2026   # ellipsis U+2026
    ([string][char]0x00E2 + [char]0x20AC + [char]0x02DC) = [string][char]0x2018   # left single quote U+2018
    ([string][char]0x00E2 + [char]0x20AC + [char]0x2122) = [string][char]0x2019   # right single quote U+2019
    ([string][char]0x00E2 + [char]0x20AC + [char]0x0153) = [string][char]0x201C   # left double quote U+201C
    ([string][char]0x00E2 + [char]0x20AC + [char]0x2026) = [string][char]0x2026   # ellipsis alt
}

foreach ($f in $files) {
    $bytes = [IO.File]::ReadAllBytes($f.FullName)
    $text = $utf8.GetString($bytes)
    $orig = $text
    foreach ($bad in $map.Keys) {
        $text = $text.Replace($bad, $map[$bad])
    }
    if ($text -ne $orig) {
        [IO.File]::WriteAllBytes($f.FullName, $utf8.GetBytes($text))
        Write-Host "Fixed: $($f.Name)"
        $fixedCount++
    }
}
Write-Host "Done. $fixedCount file(s) fixed."
