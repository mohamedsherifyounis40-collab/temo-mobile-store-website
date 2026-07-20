<#
سكريبت واحد يعمل الخطوات التلاتة مع بعض: مزامنة المنتجات من CatalogWebsite،
ثم Commit و Push للتغيير على GitHub. Cloudflare هيعمل نشر تلقائي بعدها لوحده.

الاستخدام:
  .\publish.ps1
  .\publish.ps1 -CatalogUrl "https://your-catalog-domain.com"
#>

param(
    [string]$CatalogUrl = "http://localhost:5013"
)

$scriptsDir = $PSScriptRoot
$root = Split-Path -Parent $scriptsDir
Set-Location $root

Write-Output "Step 1/3: Syncing products from $CatalogUrl ..."
& (Join-Path $scriptsDir "sync-catalog.ps1") -CatalogUrl $CatalogUrl

$changed = git diff --name-only -- data/products.json
if (-not $changed) {
    Write-Output ""
    Write-Output "No changes in data/products.json - nothing to publish."
    exit 0
}

Write-Output ""
Write-Output "Step 2/3: Committing data/products.json ..."
git add data/products.json
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Sync products from POS ($timestamp)"

Write-Output ""
Write-Output "Step 3/3: Pushing to GitHub ..."
git push

Write-Output ""
Write-Output "Done. Cloudflare will redeploy automatically in a few seconds."
