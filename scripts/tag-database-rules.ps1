$jsonPath = "data\quotes_8000_plus.json"
$outPath = "data\quotes_enriched.json"

# Ensure output directories exist
Write-Host "Reading raw database from $jsonPath..."
$raw = Get-Content -Raw -Path $jsonPath -Encoding UTF8 | ConvertFrom-Json
$categories = $raw.categories

Write-Host "Enriching quotes with metadata rules..."
$idCounter = 1

$enrichedCategories = [ordered]@{}

foreach ($prop in $categories.psobject.properties) {
    $catName = $prop.Name
    $catData = $prop.Value
    $quotes = $catData.quotes
    
    $enrichedQuotes = [System.Collections.Generic.List[PSObject]]::new()
    
    foreach ($q in $quotes) {
        $text = $q.quote
        $lowerText = $text.ToLower()
        
        # 1. Word count and length
        $words = $text.Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)
        $wordCount = $words.Count
        $length = "Medium"
        if ($wordCount -lt 10) { $length = "Short" }
        elseif ($wordCount -gt 35) { $length = "Long" }
        
        # 2. Language and format
        $language = "en"
        $format = "Quote"
        
        # Detect Hinglish/Hindi keywords for Shayari
        if ($lowerText -match "\b(dil|pyaar|mohabbat|zindagi|dost|humsafar|ishq|pyar|tamanna|khushi|wafa|dard)\b") {
            $language = "hi-Latn"
            $format = "Shayari"
        }
        
        # Detect wishes
        if ($lowerText -match "\b(wish|wishing|may your|congrats|congratulations|hope you have|happy birthday|happy anniversary|good morning|good night)\b") {
            $format = "Wish"
        }
        elseif ($wordCount -le 15 -and $lowerText.Contains("#")) {
            $format = "Caption"
        }
        
        # 3. Occasion
        $occasion = "General"
        if ($lowerText -match "\b(birthday|birth day)\b" -or $catName -eq "Birthday") { $occasion = "Birthday" }
        elseif ($lowerText -match "\banniversary\b") { $occasion = "Anniversary" }
        elseif ($lowerText -match "\b(wedding|marry|marriage)\b") { $occasion = "Wedding" }
        elseif ($lowerText -match "\bfarewell\b") { $occasion = "Farewell" }
        elseif ($lowerText -match "\b(graduation|graduate)\b") { $occasion = "Graduation" }
        elseif ($lowerText -match "\b(good morning|morning)\b") { $occasion = "Good Morning" }
        elseif ($lowerText -match "\b(good night|night)\b") { $occasion = "Good Night" }
        elseif ($lowerText -match "\b(new year)\b") { $occasion = "New Year" }
        
        # 4. Relationship
        $relationship = "General"
        if ($lowerText -match "\bgirlfriend\b") { $relationship = "Girlfriend" }
        elseif ($lowerText -match "\bboyfriend\b") { $relationship = "Boyfriend" }
        elseif ($lowerText -match "\bhusband\b") { $relationship = "Husband" }
        elseif ($lowerText -match "\bwife\b") { $relationship = "Wife" }
        elseif ($lowerText -match "\bbrother\b") { $relationship = "Brother" }
        elseif ($lowerText -match "\bsister\b") { $relationship = "Sister" }
        elseif ($lowerText -match "\b(mother|mom)\b") { $relationship = "Mother" }
        elseif ($lowerText -match "\b(father|dad)\b") { $relationship = "Father" }
        elseif ($lowerText -match "\bbest friend\b") { $relationship = "Best Friend" }
        elseif ($lowerText -match "\b(friend|dost)\b") { $relationship = "Friend" }
        elseif ($lowerText -match "\bboss\b") { $relationship = "Boss" }
        elseif ($lowerText -match "\bteacher\b") { $relationship = "Teacher" }
        elseif ($lowerText -match "\b(colleague|coworker)\b") { $relationship = "Colleague" }
        
        # 5. Tones
        $tones = [System.Collections.Generic.List[string]]::new()
        if ($lowerText -match "\b(funny|joke|laugh|hilarious)\b" -or $catName -eq "Humor") { $tones.Add("Funny") }
        if ($lowerText -match "\b(romantic|love|kiss|heart|beloved)\b" -or $catName -eq "Love") { $tones.Add("Romantic") }
        if ($lowerText -match "\b(sad|cry|tears|grief|pain|broken)\b") { $tones.Add("Sad") }
        if ($lowerText -match "\b(savage|attitude|own|style|boss)\b") { $tones.Add("Savage/Attitude") }
        if ($lowerText -match "\b(inspire|motivate|dream|success|achieve|strive|work)\b" -or $catName -eq "Success") { $tones.Add("Inspirational") }
        
        if ($tones.Count -eq 0) { $tones.Add("Deep") }
        
        # Construct fresh new object directly with category field included
        $newQ = [PSCustomObject]@{
            quote = $q.quote
            author = $q.author
            popularity = $q.popularity
            tags = $q.tags
            category = $catName
            id = ("q_" + $idCounter.ToString("D6"))
            wordCount = $wordCount
            length = $length
            language = $language
            format = $format
            occasion = $occasion
            relationship = $relationship
            tone = $tones.ToArray()
        }
        
        $enrichedQuotes.Add($newQ)
        $idCounter++
    }
    
    $enrichedCategories[$catName] = @{
        count = $catData.count
        quotes = $enrichedQuotes
    }
}

Write-Host "Writing enriched database to $outPath..."
$outputData = [ordered]@{
    metadata = $raw.metadata
    categories = $enrichedCategories
}
$outputData | ConvertTo-Json -Depth 10 | Set-Content -Path $outPath -Encoding UTF8
Write-Host "Tagging pipeline completed successfully! Enriched $($idCounter - 1) quotes."
