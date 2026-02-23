#!/usr/bin/env pwsh
# =====================================================
# Docker Management Script for Academic Platform
# Usage: ./docker.ps1 [command]
# =====================================================

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║        Docker Management Script - Academic Platform          ║
╚══════════════════════════════════════════════════════════════╝

🚀 USAGE:
    ./docker.ps1 [command]

📋 COMMANDS:

  Development:
    dev           Start in development mode (hot-reload)
    dev-build     Rebuild and start in development mode
    dev-stop      Stop development containers

  Production:
    up            Start in production mode
    build         Rebuild production images
    down          Stop and remove all containers
    restart       Restart all services

  Database:
    db-connect    Connect to MySQL database
    db-backup     Backup database to ./backups/
    db-restore    Restore database from backup
    db-reset      Reset database (WARNING: deletes all data)

  Monitoring:
    logs          Show all logs (follow)
    logs-api      Show backend logs only
    logs-db       Show MySQL logs only
    status        Show container status
    stats         Show resource usage

  Maintenance:
    clean         Remove stopped containers and images
    clean-all     Remove everything (containers, volumes, images)
    prune         Clean unused Docker resources

  Utilities:
    shell         Open shell in backend container
    db-shell      Open MySQL shell
    phpmyadmin    Start phpMyAdmin on port 8080
    test          Run tests in container

  Info:
    help          Show this help message
    version       Show Docker and app versions

📖 EXAMPLES:
    ./docker.ps1 dev              # Start development server
    ./docker.ps1 logs-api         # Check backend logs
    ./docker.ps1 db-backup        # Backup database

"@
}

function Invoke-Dev {
    Write-Host "🚀 Starting in DEVELOPMENT mode..." -ForegroundColor Green
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
}

function Invoke-DevBuild {
    Write-Host "🔨 Building and starting in DEVELOPMENT mode..." -ForegroundColor Yellow
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
}

function Invoke-DevStop {
    Write-Host "🛑 Stopping development containers..." -ForegroundColor Yellow
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
}

function Invoke-Up {
    Write-Host "🚀 Starting in PRODUCTION mode..." -ForegroundColor Green
    docker-compose up -d
    docker-compose ps
}

function Invoke-Build {
    Write-Host "🔨 Building production images..." -ForegroundColor Yellow
    docker-compose build --no-cache
    docker-compose up -d
}

function Invoke-Down {
    Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
    docker-compose down
}

function Invoke-Restart {
    Write-Host "🔄 Restarting all services..." -ForegroundColor Cyan
    docker-compose restart
    docker-compose ps
}

function Invoke-Logs {
    Write-Host "📋 Showing all logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose logs -f
}

function Invoke-LogsAPI {
    Write-Host "📋 Showing backend logs..." -ForegroundColor Cyan
    docker-compose logs -f backend
}

function Invoke-LogsDB {
    Write-Host "📋 Showing MySQL logs..." -ForegroundColor Cyan
    docker-compose logs -f mysql
}

function Invoke-Status {
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host "`n🔗 URLs:" -ForegroundColor Cyan
    Write-Host "   Backend:    http://localhost:3000" -ForegroundColor Green
    Write-Host "   API Docs:   http://localhost:3000/api-docs" -ForegroundColor Green
    Write-Host "   phpMyAdmin: http://localhost:8080" -ForegroundColor Green
}

function Invoke-Stats {
    Write-Host "📈 Resource Usage:" -ForegroundColor Cyan
    docker stats --no-stream
}

function Invoke-DBConnect {
    Write-Host "🔌 Connecting to MySQL..." -ForegroundColor Cyan
    $env:MYSQL_PWD = "root123"
    docker-compose exec mysql mysql -u root academic_collaboration_db
}

function Invoke-DBBackup {
    $BackupDir = "./backups"
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupFile = "$BackupDir/backup_$Timestamp.sql"
    Write-Host "💾 Backing up database to $BackupFile..." -ForegroundColor Yellow
    docker-compose exec -T mysql mysqldump -u root -proot123 academic_collaboration_db > $BackupFile
    Write-Host "✅ Backup completed!" -ForegroundColor Green
}

function Invoke-DBRestore {
    $Backups = Get-ChildItem -Path "./backups/*.sql" | Sort-Object LastWriteTime -Descending
    if ($Backups.Count -eq 0) {
        Write-Host "❌ No backups found in ./backups/" -ForegroundColor Red
        return
    }
    Write-Host "📂 Available backups:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $Backups.Count; $i++) {
        Write-Host "  [$i] $($Backups[$i].Name)"
    }
    $Selection = Read-Host "Enter backup number to restore"
    $BackupFile = $Backups[$Selection].FullName
    Write-Host "⚠️  WARNING: This will overwrite the current database!" -ForegroundColor Red
    $Confirm = Read-Host "Type 'yes' to continue"
    if ($Confirm -eq "yes") {
        Write-Host "📥 Restoring from $($Backups[$Selection].Name)..." -ForegroundColor Yellow
        Get-Content $BackupFile | docker-compose exec -T mysql mysql -u root -proot123 academic_collaboration_db
        Write-Host "✅ Restore completed!" -ForegroundColor Green
    }
}

function Invoke-DBReset {
    Write-Host "⚠️  WARNING: This will DELETE ALL DATA!" -ForegroundColor Red
    $Confirm = Read-Host "Type 'DELETE' to confirm"
    if ($Confirm -eq "DELETE") {
        Write-Host "🔄 Resetting database..." -ForegroundColor Yellow
        docker-compose exec -T mysql mysql -u root -proot123 -e "DROP DATABASE IF EXISTS academic_collaboration_db; CREATE DATABASE academic_collaboration_db;"
        Get-Content "./database-schema.sql" | docker-compose exec -T mysql mysql -u root -proot123 academic_collaboration_db
        Write-Host "✅ Database reset completed!" -ForegroundColor Green
    }
}

function Invoke-Clean {
    Write-Host "🧹 Cleaning up stopped containers and images..." -ForegroundColor Yellow
    docker-compose down --remove-orphans
    docker image prune -f
    Write-Host "✅ Cleanup completed!" -ForegroundColor Green
}

function Invoke-CleanAll {
    Write-Host "⚠️  WARNING: This will remove ALL containers, volumes, and images!" -ForegroundColor Red
    $Confirm = Read-Host "Type 'DELETE' to confirm"
    if ($Confirm -eq "DELETE") {
        Write-Host "🧹 Removing everything..." -ForegroundColor Yellow
        docker-compose down -v --remove-orphans
        docker system prune -af --volumes
        Write-Host "✅ Complete cleanup done!" -ForegroundColor Green
    }
}

function Invoke-Prune {
    Write-Host "🧹 Cleaning unused Docker resources..." -ForegroundColor Yellow
    docker system prune -f
    Write-Host "✅ Prune completed!" -ForegroundColor Green
}

function Invoke-Shell {
    Write-Host "💻 Opening shell in backend container..." -ForegroundColor Cyan
    docker-compose exec backend sh
}

function Invoke-DBShell {
    Write-Host "💻 Opening MySQL shell..." -ForegroundColor Cyan
    docker-compose exec mysql mysql -u root -proot123 academic_collaboration_db
}

function Invoke-PHPMyAdmin {
    Write-Host "🌐 Starting phpMyAdmin..." -ForegroundColor Cyan
    docker-compose --profile tools up -d phpmyadmin
    Write-Host "✅ phpMyAdmin running at http://localhost:8080" -ForegroundColor Green
}

function Invoke-Test {
    Write-Host "🧪 Running tests in container..." -ForegroundColor Cyan
    docker-compose exec backend npm test
}

function Invoke-Version {
    Write-Host "📦 Version Information:" -ForegroundColor Cyan
    Write-Host "  Docker:       $(docker --version)"
    Write-Host "  Compose:      $(docker-compose --version)"
    Write-Host "  App:          Academic Collaboration Platform v1.0"
}

# =====================================================
# Main Command Router
# =====================================================

switch ($Command.ToLower()) {
    "dev"           { Invoke-Dev }
    "dev-build"     { Invoke-DevBuild }
    "dev-stop"      { Invoke-DevStop }
    "up"            { Invoke-Up }
    "build"         { Invoke-Build }
    "down"          { Invoke-Down }
    "restart"       { Invoke-Restart }
    "logs"          { Invoke-Logs }
    "logs-api"      { Invoke-LogsAPI }
    "logs-db"       { Invoke-LogsDB }
    "status"        { Invoke-Status }
    "stats"         { Invoke-Stats }
    "db-connect"    { Invoke-DBConnect }
    "db-backup"     { Invoke-DBBackup }
    "db-restore"    { Invoke-DBRestore }
    "db-reset"      { Invoke-DBReset }
    "clean"         { Invoke-Clean }
    "clean-all"     { Invoke-CleanAll }
    "prune"         { Invoke-Prune }
    "shell"         { Invoke-Shell }
    "db-shell"      { Invoke-DBShell }
    "phpmyadmin"    { Invoke-PHPMyAdmin }
    "test"          { Invoke-Test }
    "version"       { Invoke-Version }
    "help"          { Show-Help }
    default {
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Write-Host "Run './docker.ps1 help' for usage" -ForegroundColor Yellow
    }
}
