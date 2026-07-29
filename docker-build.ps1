param(
    [string]$ImageName = "streamscribe"
)

$ErrorActionPreference = "Stop"

$version = (nbgv get-version -v NpmPackageVersion 2>$null) -replace '-.*', ''
if (-not $version) {
    Write-Error "Failed to get version from nbgv. Is Nerdbank.GitVersioning installed?"
    exit 1
}

Write-Host "Building $ImageName`:$version" -ForegroundColor Cyan

docker build -t "${ImageName}:${version}" -t "${ImageName}:latest" .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully built ${ImageName}:${version} and ${ImageName}:latest" -ForegroundColor Green
} else {
    Write-Error "Docker build failed"
    exit 1
}
