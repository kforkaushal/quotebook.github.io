$ErrorActionPreference = "Stop"

$scriptsToUpdate = @(
    "scripts\generate-social-seo.ps1",
    "scripts\generate-collection-seo.ps1",
    "scripts\generate-seo-network.ps1"
)

foreach ($scriptPath in $scriptsToUpdate) {
    if (-not (Test-Path $scriptPath)) { continue }
    
    $content = Get-Content $scriptPath -Raw -Encoding UTF8
    
    # 1. Update relative paths
    $content = $content -replace '"\.\./src/', '"../../src/'
    $content = $content -replace '"\.\./data/', '"../../data/'
    $content = $content -replace '"\.\./index\.html', '"../../index.html'
    $content = $content -replace '"\.\./quotes\.html', '"../../quotes.html'
    $content = $content -replace '"\.\./poster\.html', '"../../poster.html'
    
    # 2. Add catSlug definition
    $searchSlug = '$slug = "$($catName.ToLower() -replace ''_'', ''-'')-$($subName.ToLower() -replace ''_'', ''-'')"'
    $replaceSlug = $searchSlug + "`n        `$catSlug = `$catName.ToLower() -replace '_', '-' -replace ' & ', '-' -replace ' ', '-' -replace '[^\w-]', ''"
    if ($content -match [regex]::Escape($searchSlug)) {
        $content = $content.Replace($searchSlug, $replaceSlug)
    }

    # 3. Update Canonical URL definition
    $searchUrl = '$canonicalUrl = "https://quotebook.example.com/quotes/$slug.html"'
    $replaceUrl = '$canonicalUrl = "https://quotebook.example.com/quotes/$catSlug/$slug.html"'
    if ($content -match [regex]::Escape($searchUrl)) {
        $content = $content.Replace($searchUrl, $replaceUrl)
    }

    # 4. Update file writing path (there are two variants)
    $searchWrite1 = '$outPath = Join-Path -Path $quotesDir -ChildPath "$slug.html"'
    $replaceWrite1 = @"
`$outDir = Join-Path `$quotesDir `$catSlug
        if (!(Test-Path `$outDir)) { New-Item -ItemType Directory -Path `$outDir | Out-Null }
        `$outPath = Join-Path -Path `$outDir -ChildPath "`$slug.html"
"@
    if ($content -match [regex]::Escape($searchWrite1)) {
        $content = $content.Replace($searchWrite1, $replaceWrite1)
    }

    $searchWrite2 = '$outFilePath = Join-Path $quotesDir "$slug.html"'
    $replaceWrite2 = @"
`$outDir = Join-Path `$quotesDir `$catSlug
    if (!(Test-Path `$outDir)) { New-Item -ItemType Directory -Path `$outDir | Out-Null }
    `$outFilePath = Join-Path `$outDir "`$slug.html"
"@
    if ($content -match [regex]::Escape($searchWrite2)) {
        $content = $content.Replace($searchWrite2, $replaceWrite2)
    }

    # 5. Update Sitemap crawler
    $searchSitemap = @"
foreach (`$file in Get-ChildItem -Path `$quotesDir -Filter "*.html") {
    `$fileSlug = `$file.BaseName
    `$canonical = "https://quotebook.example.com/quotes/`$fileSlug.html"
"@
    $replaceSitemap = @"
foreach (`$dir in Get-ChildItem -Path `$quotesDir -Directory) {
    foreach (`$file in Get-ChildItem -Path `$dir.FullName -Filter "*.html") {
        `$fileSlug = `$file.BaseName
        `$catSlugFolder = `$dir.Name
        `$canonical = "https://quotebook.example.com/quotes/`$catSlugFolder/`$fileSlug.html"
"@
    if ($content -match [regex]::Escape($searchSitemap)) {
        $content = $content.Replace($searchSitemap, $replaceSitemap)
        # We need to add one more `}` for the extra loop
        $searchSitemapEnd = @"
        `$sitemapUrls.Add(`$canonical)
    }
}
"@
        $replaceSitemapEnd = @"
        `$sitemapUrls.Add(`$canonical)
    }
    }
}
"@
        $content = $content.Replace($searchSitemapEnd, $replaceSitemapEnd)
    }
    
    # 6. Add config.js script
    $searchScript = '<script src="../../src/js/app.js"></script>'
    $replaceScript = '<script src="../../src/js/config.js"></script>`n  <script src="../../src/js/app.js"></script>'
    if ($content -match [regex]::Escape($searchScript)) {
        if (-not $content.Contains('config.js')) {
            $content = $content.Replace($searchScript, $replaceScript)
        }
    }

    [System.IO.File]::WriteAllText($scriptPath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Updated $scriptPath"
}

Write-Host "Done updating generation scripts."
