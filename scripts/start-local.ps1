$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$databaseUrl = 'postgresql://postgres:postgres@localhost:5432/postgres'

$bootstrapScript = Join-Path $PSScriptRoot 'bootstrap-local-postgres.ps1'
& $bootstrapScript
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host 'Starting Campus Placement Hub locally...' -ForegroundColor Green

$apiCommand = @(
    '-NoExit',
    '-Command',
    "Set-Location '$repoRoot'; `$env:DATABASE_URL = '$databaseUrl'; `$env:SESSION_SECRET = 'dev-secret'; `$env:JWT_SECRET = 'dev-secret'; `$env:PORT = '3001'; `$env:NODE_ENV = 'development'; npx pnpm --filter @workspace/api-server run dev"
)
$apiProcess = Start-Process powershell -ArgumentList $apiCommand -PassThru

$frontendCommand = @(
    '-NoExit',
    '-Command',
    "Set-Location '$repoRoot'; `$env:PORT = '4173'; `$env:BASE_PATH = '/'; `$env:NODE_ENV = 'development'; npx pnpm --filter @workspace/campus-placement run dev"
)
$frontendProcess = Start-Process powershell -ArgumentList $frontendCommand -PassThru

Write-Host ''
Write-Host 'API process started:' -ForegroundColor Cyan
Write-Host "  PID: $($apiProcess.Id) | http://localhost:3001/api/healthz" -ForegroundColor Cyan
Write-Host 'Frontend process started:' -ForegroundColor Cyan
Write-Host "  PID: $($frontendProcess.Id) | http://localhost:4173" -ForegroundColor Cyan
Write-Host ''
Write-Host 'Use Ctrl+C in each terminal window to stop the services.' -ForegroundColor Yellow
