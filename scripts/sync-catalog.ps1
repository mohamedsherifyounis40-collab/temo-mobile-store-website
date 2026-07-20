<#
سكريبت مزامنة الموقع مع الكتالوج الحي (CatalogWebsite) المتصل ببرنامج المحل.

الاستخدام:
  .\sync-catalog.ps1                                   # يزامن من http://localhost:5013 ويحدث data/products.json
  .\sync-catalog.ps1 -CatalogUrl "https://your-domain"  # لما ننشر CatalogWebsite فعليا
  .\sync-catalog.ps1 -PreviewOnly                       # يجرب من غير ما يلمس products.json الاساسي

المصدر الوحيد لقسم/شركة/وصف كل منتج هو data/product-meta.json، لان مخزون
البرنامج نفسه بيعرف بس: الاسم، السعر، الكمية، الباركود، الصورة.
#>

param(
    [string]$CatalogUrl = "http://localhost:5013",
    [switch]$PreviewOnly
)

$root = Split-Path -Parent $PSScriptRoot
$metaPath = Join-Path $root "data\product-meta.json"
$outPath = if ($PreviewOnly) { Join-Path $root "data\products.synced-preview.json" } else { Join-Path $root "data\products.json" }

Write-Output "Connecting to $CatalogUrl/api/products ..."
$liveProducts = Invoke-RestMethod -Uri "$CatalogUrl/api/products"

$meta = @{}
if (Test-Path $metaPath) {
    $metaRaw = Get-Content $metaPath -Raw | ConvertFrom-Json
    $metaRaw.PSObject.Properties | ForEach-Object { $meta[$_.Name] = $_.Value }
}

$missingMeta = @()
$result = foreach ($p in $liveProducts) {
    $m = $meta[$p.barcode]
    if (-not $m) {
        $missingMeta += "$($p.barcode) - $($p.productName)"
    }

    [ordered]@{
        id             = $p.barcode
        name           = $p.productName
        brand          = if ($m) { $m.brand } else { "" }
        category       = if ($m) { $m.category } else { "other" }
        price          = $p.salePrice
        originalPrice  = $p.originalPrice
        quantity       = $p.quantity
        featured       = if ($m) { [bool]$m.featured } else { $false }
        isNew          = if ($m) { [bool]$m.isNew } else { $false }
        image          = if ($p.hasImage) { "$CatalogUrl/image/$($p.barcode)" } else { "" }
        description    = if ($m) { $m.description } else { "" }
    }
}

$json = $result | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($outPath, $json, [System.Text.UTF8Encoding]::new($false))

Write-Output "Synced $($result.Count) products -> $outPath"

if ($missingMeta.Count -gt 0) {
    Write-Output ""
    Write-Output "Products missing category/brand in data\product-meta.json:"
    $missingMeta | ForEach-Object { Write-Output "  - $_" }
}
