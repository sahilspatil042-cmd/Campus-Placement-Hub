$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$databaseUrl = 'postgresql://postgres:postgres@localhost:5432/postgres'

function Test-CommandAvailable($Name) {
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Wait-ForPostgres([int]$TimeoutSeconds = 60) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-CommandAvailable 'pg_isready') {
            & pg_isready -h localhost -p 5432 -U postgres 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) { return $true }
        }

        if (Test-CommandAvailable 'docker') {
            $status = & docker ps --filter "name=campus-placement-postgres" --format "{{.Status}}" 2>$null
            if ($LASTEXITCODE -eq 0 -and $status) {
                & docker exec campus-placement-postgres pg_isready -U postgres -d postgres 2>$null | Out-Null
                if ($LASTEXITCODE -eq 0) { return $true }
            }
        }

        Start-Sleep -Seconds 2
    }

    return $false
}

function Ensure-DockerPostgres {
    if (-not (Test-CommandAvailable 'docker')) { return $false }

    $containerExists = & docker ps -a --filter "name=campus-placement-postgres" --format "{{.Names}}" 2>$null
    if ($LASTEXITCODE -ne 0) { return $false }

    if (-not $containerExists) {
        Write-Host 'Starting PostgreSQL via Docker...' -ForegroundColor Cyan
        & docker run --name campus-placement-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres -p 5432:5432 -d postgres:16-alpine
        if ($LASTEXITCODE -ne 0) { throw 'Failed to start PostgreSQL via Docker.' }
    }
    else {
        $running = & docker ps --filter "name=campus-placement-postgres" --format "{{.Names}}" 2>$null
        if (-not $running) {
            Write-Host 'Starting existing PostgreSQL container...' -ForegroundColor Cyan
            & docker start campus-placement-postgres
            if ($LASTEXITCODE -ne 0) { throw 'Failed to start the existing PostgreSQL container.' }
        }
    }

    return $true
}

function Ensure-NativePostgres {
    if (-not (Test-CommandAvailable 'initdb')) { return $false }
    if (-not (Test-CommandAvailable 'pg_ctl')) { return $false }
    if (-not (Test-CommandAvailable 'psql')) { return $false }

    $pgDataDir = Join-Path $repoRoot '.postgres\data'
    $pgLogFile = Join-Path $repoRoot '.postgres\postgres.log'
    if (-not (Test-Path $pgDataDir)) {
        New-Item -ItemType Directory -Path $pgDataDir -Force | Out-Null
    }

    $clusterInitialized = Test-Path (Join-Path $pgDataDir 'PG_VERSION')
    if (-not $clusterInitialized) {
        Write-Host 'Initializing local PostgreSQL cluster...' -ForegroundColor Cyan
        $pwFile = Join-Path $repoRoot '.postgres\pwfile.txt'
        Set-Content -Path $pwFile -Value 'postgres'
        & initdb -D $pgDataDir -U postgres --auth=scram-sha-256 --pwfile=$pwFile 2>$null
        if ($LASTEXITCODE -ne 0) { throw 'Failed to initialize local PostgreSQL.' }
    }

    $status = & pg_ctl -D $pgDataDir status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Starting local PostgreSQL...' -ForegroundColor Cyan
        & pg_ctl -D $pgDataDir -l $pgLogFile -o '-p 5432' start
        if ($LASTEXITCODE -ne 0) { throw 'Failed to start local PostgreSQL.' }
    }

    return $true
}

function Ensure-DatabaseExists {
    $env:PGPASSWORD = 'postgres'
    $dbExists = & psql -h localhost -U postgres -d postgres -p 5432 -Atqc "SELECT 1 FROM pg_database WHERE datname = 'postgres';" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not query PostgreSQL.'
    }
    if (-not $dbExists) {
        Write-Host 'Creating default Postgres database...' -ForegroundColor Cyan
        & psql -h localhost -U postgres -d postgres -p 5432 -c 'CREATE DATABASE postgres;' 2>$null
        if ($LASTEXITCODE -ne 0) { throw 'Failed to create the default Postgres database.' }
    }
}

Write-Host 'Checking local PostgreSQL...' -ForegroundColor Green

$started = $false
try {
    if (Ensure-DockerPostgres) {
        $started = Wait-ForPostgres
    }
    elseif (Ensure-NativePostgres) {
        $started = Wait-ForPostgres
    }

    if ($started) {
        Ensure-DatabaseExists
    }
}
catch {
    Write-Host "PostgreSQL bootstrap failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

if (-not $started) {
    Write-Host ''
    Write-Host 'PostgreSQL is not available on this machine.' -ForegroundColor Yellow
    Write-Host 'Install PostgreSQL 16 or enable Docker Desktop, then rerun this script.' -ForegroundColor Yellow
    exit 1
}

Write-Host ''
Write-Host 'Starting Campus Placement Hub locally...' -ForegroundColor Green

$env:DATABASE_URL = $databaseUrl
$env:SESSION_SECRET = 'dev-secret'
$env:JWT_SECRET = 'dev-secret'
$env:PORT = '3001'
$env:NODE_ENV = 'development'

$apiProcess = Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$repoRoot'; `$env:DATABASE_URL = '$databaseUrl'; `$env:SESSION_SECRET = 'dev-secret'; `$env:JWT_SECRET = 'dev-secret'; `$env:PORT = '3001'; `$env:NODE_ENV = 'development'; npx pnpm --filter @workspace/api-server run dev"
) -PassThru

$frontendProcess = Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$repoRoot'; `$env:PORT = '4173'; `$env:BASE_PATH = '/'; `$env:NODE_ENV = 'development'; npx pnpm --filter @workspace/campus-placement run dev"
) -PassThru

Write-Host ''
Write-Host 'API running at http://localhost:3001/api/healthz' -ForegroundColor Cyan
Write-Host 'Frontend running at http://localhost:4173' -ForegroundColor Cyan
Write-Host "API PID: $($apiProcess.Id) | Frontend PID: $($frontendProcess.Id)" -ForegroundColor Cyan
Write-Host 'Use Ctrl+C in each terminal window to stop them.' -ForegroundColor Yellow
