<# 
  YB_YMM Website — Full Project Audit
  Run from project root (YB_YMM_WEBSITE)
#>

$ErrorActionPreference = "Stop"

function New-AuditDir {
  $dir = Join-Path (Get-Location) "audit"
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  return $dir
}

function Get-FileTree {
  param([string]$Root = ".")
  $items = Get-ChildItem -Recurse -Force -ErrorAction SilentlyContinue | 
    Where-Object { -not $_.PSIsContainer } |
    ForEach-Object { $_.FullName.Replace((Get-Location).Path + "\","").Replace("\","/") }
  return ($items | Sort-Object)
}

function Flatten-Json {
  param(
    [Parameter(Mandatory=$true)] [hashtable] $Json,
    [string] $Prefix = ""
  )
  $flat = @{}
  foreach ($k in $Json.Keys) {
    $key = if ($Prefix) { "$Prefix.$k" } else { "$k" }
    $val = $Json[$k]
    if ($val -is [hashtable]) {
      $nested = Flatten-Json -Json $val -Prefix $key
      foreach ($nk in $nested.Keys) { $flat[$nk] = $nested[$nk] }
    } elseif ($val -is [System.Object[]]) {
      # Convert arrays to comma-joined strings for translation
      $flat[$key] = ($val | ForEach-Object { $_ -as [string] }) -join ", "
    } else {
      $flat[$key] = "$val"
    }
  }
  return $flat
}

function Load-JsonFile {
  param([string]$Path)
  if (!(Test-Path $Path)) { return $null }
  try {
    $raw = Get-Content -Raw -Encoding UTF8 $Path
    if ([string]::IsNullOrWhiteSpace($raw)) { return @{} }
    $obj = $raw | ConvertFrom-Json -AsHashtable
    if ($null -eq $obj) { return @{} }
    return $obj
  } catch {
    return @{}
  }
}

function Test-Plausible {
  param([string]$IndexHtmlPath)
  if (!(Test-Path $IndexHtmlPath)) { return "index.html not found" }
  $html = Get-Content -Raw -Encoding UTF8 $IndexHtmlPath
  if ($html -match "plausible\.io" -or $html -match "data-domain=`"ybconsulting\.ai`"") {
    return "Plausible snippet FOUND"
  } else {
    return "Plausible snippet NOT FOUND"
  }
}

function Test-AskYB-Cors {
  param([string]$FnPath)
  if (!(Test-Path $FnPath)) { return "ask-yb.js not found" }
  $code = Get-Content -Raw -Encoding UTF8 $FnPath
  $cors1 = $code -match "Access-Control-Allow-Origin"
  $cors2 = $code -match "Access-Control-Allow-Headers"
  $cors3 = $code -match "Access-Control-Allow-Methods"
  $hasOptions = $code -match "OPTIONS"
  $streaming = $code -match "ReadableStream|stream|on\('data'\)"
  return @(
    "CORS: Origin=" + ($cors1),
    "CORS: Headers=" + ($cors2),
    "CORS: Methods=" + ($cors3),
    "Has OPTIONS handler=" + ($hasOptions),
    "Streaming hint found=" + ($streaming)
  ) -join "`n"
}

function Test-Netlify {
  param([string]$TomlPath, [string]$RedirectsPath)
  $out = @()
  if (Test-Path $TomlPath) {
    $toml = Get-Content -Raw -Encoding UTF8 $TomlPath
    $fnMatch = ($toml -match 'functions\s*=\s*"website/netlify/functions"') -or ($toml -match '\[functions\]')
    $buildMatch = ($toml -match 'publish\s*=\s*"website/dist"') -or ($toml -match 'publish\s*=\s*"dist"')
    $out += "netlify.toml present"
    $out += "functions dir mapping present? " + $fnMatch
    $out += "publish=dist present? " + $buildMatch
  } else {
    $out += "netlify.toml NOT found"
  }

  if (Test-Path $RedirectsPath) {
    $redir = Get-Content -Raw -Encoding UTF8 $RedirectsPath
    $hasFunction = $redir -match "/api/ask-yb\s+/\.netlify/functions/ask-yb"
    $hasSpa = $redir -match "/*\s+/index.html\s+200"
    $out += "_redirects present"
    $out += "Mapping /api/ask-yb -> /.netlify/functions/ask-yb ? " + $hasFunction
    $out += "SPA fallback /* -> /index.html 200 ? " + $hasSpa
  } else {
    $out += "_redirects NOT found"
  }
  return $out -join "`n"
}

function Ensure-Audit {
  $dir = New-AuditDir
  # 1) Files tree
  (Get-FileTree | Out-String) | Set-Content -Encoding UTF8 (Join-Path $dir "files-tree.txt")

  # 2) Package + versions
  $pkgPath = Join-Path (Get-Location) "package.json"
  $pkgJson = Load-JsonFile -Path $pkgPath
  $meta = [ordered]@{
    node_version = $($env:node_version)
    npm_version  = (& npm -v) 2>$null
    detected_node = (& node -v) 2>$null
    name = $pkgJson.name
    version = $pkgJson.version
    scripts = $pkgJson.scripts
    dependencies = $pkgJson.dependencies
    devDependencies = $pkgJson.devDependencies
  }
  ($meta | ConvertTo-Json -Depth 6) | Set-Content -Encoding UTF8 (Join-Path $dir "package-meta.json")

  # 3) Netlify & redirects
  $netlifyToml = Join-Path (Get-Location) "website\netlify.toml"
  $redirects   = Join-Path (Get-Location) "website\public\_redirects"
  (Test-Netlify -TomlPath $netlifyToml -RedirectsPath $redirects) | Set-Content -Encoding UTF8 (Join-Path $dir "netlify-check.txt")

  # 4) Ask-YB function CORS check
  $funcPath = Join-Path (Get-Location) "website\netlify\functions\ask-yb.js"
  (Test-AskYB-Cors -FnPath $funcPath) | Set-Content -Encoding UTF8 (Join-Path $dir "ask-yb-cors-check.txt")

  # 5) Plausible check
  $indexHtml = Join-Path (Get-Location) "website\index.html"
  (Test-Plausible -IndexHtmlPath $indexHtml) | Set-Content -Encoding UTF8 (Join-Path $dir "plausible-check.txt")

  # 6) i18n audit
  $pub = Join-Path (Get-Location) "website\public"
  $en = Load-JsonFile -Path (Join-Path $pub "en.json")
  $fr = Load-JsonFile -Path (Join-Path $pub "fr.json")
  $de = Load-JsonFile -Path (Join-Path $pub "de.json")
  $es = Load-JsonFile -Path (Join-Path $pub "es.json")

  $flatEN = if ($en) { Flatten-Json -Json $en } else { @{} }
  $flatFR = if ($fr) { Flatten-Json -Json $fr } else { @{} }
  $flatDE = if ($de) { Flatten-Json -Json $de } else { @{} }
  $flatES = if ($es) { Flatten-Json -Json $es } else { @{} }

  $allKeys = New-Object System.Collections.Generic.HashSet[string]
  foreach ($k in $flatEN.Keys) { $allKeys.Add($k) | Out-Null }
  foreach ($k in $flatFR.Keys) { $allKeys.Add($k) | Out-Null }
  foreach ($k in $flatDE.Keys) { $allKeys.Add($k) | Out-Null }
  foreach ($k in $flatES.Keys) { $allKeys.Add($k) | Out-Null }

  $missing = @{
    FR = @()
    DE = @()
    ES = @()
  }

  foreach ($k in $allKeys) {
    if (-not $flatFR.ContainsKey($k)) { $missing.FR += $k }
    if (-not $flatDE.ContainsKey($k)) { $missing.DE += $k }
    if (-not $flatES.ContainsKey($k)) { $missing.ES += $k }
  }

  # Save i18n reports
  ($allKeys | Sort-Object | ConvertTo-Json) | Set-Content -Encoding UTF8 (Join-Path $dir "i18n_master_keys.json")
  ($missing | ConvertTo-Json -Depth 6) | Set-Content -Encoding UTF8 (Join-Path $dir "i18n-missing-keys.json")

  # CSV for translators (key, EN, FR, DE, ES)
  $rows = foreach ($k in ($allKeys | Sort-Object)) {
    [pscustomobject]@{
      key = $k
      EN  = $(if ($flatEN.ContainsKey($k)) { $flatEN[$k] } else { "" })
      FR  = $(if ($flatFR.ContainsKey($k)) { $flatFR[$k] } else { "" })
      DE  = $(if ($flatDE.ContainsKey($k)) { $flatDE[$k] } else { "" })
      ES  = $(if ($flatES.ContainsKey($k)) { $flatES[$k] } else { "" })
    }
  }
  $rows | Export-Csv -NoTypeInformation -Encoding UTF8 (Join-Path $dir "i18n_for_translation.csv")

  # 7) Env checklist
  $envChecklist = @(
    "Required env vars:",
    " - OPENAI_API_KEY (Netlify > Site settings > Environment)",
    " - PLAUSIBLE domain configured: ybconsulting.ai (already in HTML)",
    " - NODE version in Netlify: 20.x recommended",
    " - Functions dir: website/netlify/functions",
    " - Publish dir: dist (NOT website/dist if base=website in Netlify UI)"
  )
  $envChecklist | Set-Content -Encoding UTF8 (Join-Path $dir "env-checklist.txt")

  # 8) Summary markdown
  $missingCountFR = $missing.FR.Count
  $missingCountDE = $missing.DE.Count
  $missingCountES = $missing.ES.Count

  $summary = @"
# YB_YMM Website — Audit Summary

**Timestamp:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Root:** $(Get-Location)

## Stack & Build
- Node (detected): $((& node -v) 2>$null)
- npm: $((& npm -v) 2>$null)
- See: audit/package-meta.json

## Netlify
$(Get-Content (Join-Path $dir "netlify-check.txt") -Raw)

## Ask-YB CORS
$(Get-Content (Join-Path $dir "ask-yb-cors-check.txt") -Raw)

## Plausible
$(Get-Content (Join-Path $dir "plausible-check.txt") -Raw)

## i18n Status
- Total keys: $($allKeys.Count)
- Missing in FR: $missingCountFR
- Missing in DE: $missingCountDE
- Missing in ES: $missingCountES

Artifacts:
- i18n_master_keys.json
- i18n-missing-keys.json
- i18n_for_translation.csv

## Files Tree
See audit/files-tree.txt

## Next Steps
1) Fill **i18n_for_translation.csv** for FR/DE/ES (tomorrow’s sprint).
2) Add CORS headers in **ask-yb.js** if missing; map **/api/ask-yb** in _redirects.
3) Keep **publish=dist** and **functions=website/netlify/functions**.

"@
  $summary | Set-Content -Encoding UTF8 (Join-Path $dir "audit-summary.md")

  Write-Host "Audit complete. See the 'audit' folder." -ForegroundColor Green
}

# EXEC
Ensure-Audit
