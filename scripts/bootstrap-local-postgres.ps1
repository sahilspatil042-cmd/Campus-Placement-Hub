$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$pgDataDir = Join-Path $repoRoot '.postgres\data'
$pgLogFile = Join-Path $repoRoot '.postgres\postgres.log'
$pgPassword = 'postgres'
$pgDatabase = 'postgres'
$pgUser = 'postgres'
$pgPort = 5432

function Test-CommandAvailable($Name) {
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Wait-ForPostgres([int]$TimeoutSeconds = 60) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-CommandAvailable 'pg_isready') {
            & pg_isready -h localhost -p $pgPort -U $pgUser 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) { return $true }
        }

        if (Test-CommandAvailable 'docker') {
            $status = & docker ps --filter "name=campus-placement-postgres" --format "{{.Status}}" 2>$null
            if ($LASTEXITCODE -eq 0 -and $status) {
                & docker exec campus-placement-postgres pg_isready -U $pgUser -d $pgDatabase 2>$null | Out-Null
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
        & docker run --name campus-placement-postgres -e POSTGRES_USER=$pgUser -e POSTGRES_PASSWORD=$pgPassword -e POSTGRES_DB=$pgDatabase -p ${pgPort}:5432 -d postgres:16-alpine
        if ($LASTEXITCODE -ne 0) { throw 'Failed to start PostgreSQL container via Docker.' }
    }
    else {
        $running = & docker ps --filter "name=campus-placement-postgres" --format "{{.Names}}" 2>$null
        if (-not $running) {
            Write-Host 'Starting the existing PostgreSQL container...' -ForegroundColor Cyan
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

    if (-not (Test-Path $pgDataDir)) {
        New-Item -ItemType Directory -Path $pgDataDir -Force | Out-Null
    }

    $clusterInitialized = Test-Path (Join-Path $pgDataDir 'PG_VERSION')
    if (-not $clusterInitialized) {
        Write-Host 'Initializing a local PostgreSQL cluster in .postgres/data...' -ForegroundColor Cyan
        $pwFile = Join-Path $repoRoot '.postgres\pwfile.txt'
        Set-Content -Path $pwFile -Value $pgPassword
        & initdb -D $pgDataDir -U $pgUser --auth=scram-sha-256 --pwfile=$pwFile 2>$null
        if ($LASTEXITCODE -ne 0) { throw 'Failed to initialize the local PostgreSQL cluster.' }
    }

    $status = & pg_ctl -D $pgDataDir status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Starting local PostgreSQL...' -ForegroundColor Cyan
        & pg_ctl -D $pgDataDir -l $pgLogFile -o "-p $pgPort" start
        if ($LASTEXITCODE -ne 0) { throw 'Failed to start local PostgreSQL.' }
    }

    return $true
}

function Ensure-DatabaseExists {
    $env:PGPASSWORD = $pgPassword
    $dbExists = & psql -h localhost -U $pgUser -d postgres -p $pgPort -Atqc "SELECT 1 FROM pg_database WHERE datname = '$pgDatabase';" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not query the PostgreSQL server.'
    }

    if (-not $dbExists) {
        Write-Host "Creating database '$pgDatabase'..." -ForegroundColor Cyan
        & psql -h localhost -U $pgUser -d postgres -p $pgPort -c "CREATE DATABASE \"$pgDatabase\";" 2>$null
        if ($LASTEXITCODE -ne 0) { throw 'Failed to create the local PostgreSQL database.' }
    }
}

Write-Host 'Bootstrapping local PostgreSQL for Campus Placement Hub...' -ForegroundColor Green

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
    Write-Host 'Suggested options:' -ForegroundColor Yellow
    Write-Host '  1) Install PostgreSQL 16 and ensure initdb/pg_ctl/psql are on PATH' -ForegroundColor Yellow
    Write-Host '  2) Install Docker Desktop and rerun this script' -ForegroundColor Yellow
    exit 1
}

$databaseUrl = "postgresql://${pgUser}:${pgPassword}@localhost:${pgPort}/${pgDatabase}"
Write-Host ''
Write-Host 'PostgreSQL is ready.' -ForegroundColor Green
Write-Host "DATABASE_URL=$databaseUrl" -ForegroundColor Cyan
Write-Host 'Use this in a terminal session before starting the app:' -ForegroundColor Cyan
Write-Host "  `$env:DATABASE_URL = '$databaseUrl'" -ForegroundColor Cyan
Write-Host "  `$env:SESSION_SECRET = 'dev-secret'" -ForegroundColor Cyan
Write-Host "  `$env:JWT_SECRET = 'dev-secret'" -ForegroundColor Cyan
Write-Host "  `$env:PORT = '3001'" -ForegroundColor Cyan
Write-Host ''
Write-Host 'To start the app in one command, run:' -ForegroundColor Green
Write-Host '  npx pnpm run dev:local' -ForegroundColor Green

