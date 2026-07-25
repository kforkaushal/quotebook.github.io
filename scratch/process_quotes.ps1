$jsonPath = "c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook\data\quotes_collection.json"
$data = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

foreach ($cat in $data.categories.psobject.properties) {
    $category = $cat.Value
    foreach ($sub in $category.subcategories.psobject.properties) {
        $quotes = $sub.Value
        $newQuotes = @()
        foreach ($q in $quotes) {
            if ($q -is [string]) {
                $newObj = [PSCustomObject]@{
                    quote = $q
                    author = "Quotebook Studio"
                }
                $newQuotes += $newObj
            } else {
                if (-not $q.author) {
                    $q | Add-Member -MemberType NoteProperty -Name "author" -Value "Quotebook Studio"
                }
                $newQuotes += $q
            }
        }
        $category.subcategories.($sub.Name) = $newQuotes
    }
}

[IO.File]::WriteAllText($jsonPath, ($data | ConvertTo-Json -Depth 100 -Compress), [System.Text.Encoding]::UTF8)
