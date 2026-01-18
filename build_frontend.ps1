Write-Host "Building frontend..."

$distPath = "frontend\chess-frontend\dist"

if (Test-Path $distPath) {
    Write-Host "Removing old dist folder..."
    Remove-Item $distPath -Recurse -Force
}

Set-Location frontend\chess-frontend

npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Frontend build complete"