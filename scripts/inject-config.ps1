$ErrorActionPreference = "Stop"

function Inject-Config($files, $scriptPath) {
    $count = 0
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        if ($content -notmatch 'config\.js') {
            # Find the app.js script tag and prepend config.js
            $search = "<script src=`"$scriptPath/js/app.js`"></script>"
            $replace = "<script src=`"$scriptPath/js/config.js`"></script>`n  <script src=`"$scriptPath/js/app.js`"></script>"
            
            if ($content -match $search) {
                $content = $content.Replace($search, $replace)
                [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
                $count++
            }
        }
    }
    Write-Host "Injected into $count files for path $scriptPath"
}

# Root files
$rootFiles = Get-ChildItem -Path $PSScriptRoot\..\*.html
Inject-Config $rootFiles "src"

# Quotes files
$quotesFiles = Get-ChildItem -Path $PSScriptRoot\..\quotes\*.html
Inject-Config $quotesFiles "../src"
