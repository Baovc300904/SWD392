.PHONY: help dev dev-build dev-stop up build down restart logs logs-api logs-db status stats db-connect db-backup db-restore db-reset clean clean-all prune shell db-shell phpmyadmin test version

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║        Docker Management - Academic Platform                 ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(BLUE)Examples:$(NC)"
	@echo "  make dev              # Start development server"
	@echo "  make logs-api         # Check backend logs"
	@echo "  make db-backup        # Backup database"

# Development
dev: ## Start in development mode (hot-reload)
	@echo "$(GREEN)🚀 Starting in DEVELOPMENT mode...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

dev-build: ## Rebuild and start in development mode
	@echo "$(YELLOW)🔨 Building and starting in DEVELOPMENT mode...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

dev-stop: ## Stop development containers
	@echo "$(YELLOW)🛑 Stopping development containers...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Production
up: ## Start in production mode
	@echo "$(GREEN)🚀 Starting in PRODUCTION mode...$(NC)"
	docker-compose up -d
	docker-compose ps

build: ## Rebuild production images
	@echo "$(YELLOW)🔨 Building production images...$(NC)"
	docker-compose build --no-cache
	docker-compose up -d

down: ## Stop and remove all containers
	@echo "$(YELLOW)🛑 Stopping all containers...$(NC)"
	docker-compose down

restart: ## Restart all services
	@echo "$(BLUE)🔄 Restarting all services...$(NC)"
	docker-compose restart
	docker-compose ps

# Logs & Monitoring
logs: ## Show all logs (follow)
	@echo "$(BLUE)📋 Showing all logs (Ctrl+C to exit)...$(NC)"
	docker-compose logs -f

logs-api: ## Show backend logs only
	@echo "$(BLUE)📋 Showing backend logs...$(NC)"
	docker-compose logs -f backend

logs-db: ## Show MySQL logs only
	@echo "$(BLUE)📋 Showing MySQL logs...$(NC)"
	docker-compose logs -f mysql

status: ## Show container status
	@echo "$(BLUE)📊 Container Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(BLUE)🔗 URLs:$(NC)"
	@echo "   $(GREEN)Backend:    http://localhost:3000$(NC)"
	@echo "   $(GREEN)API Docs:   http://localhost:3000/api-docs$(NC)"
	@echo "   $(GREEN)phpMyAdmin: http://localhost:8080$(NC)"

stats: ## Show resource usage
	@echo "$(BLUE)📈 Resource Usage:$(NC)"
	docker stats --no-stream

# Database
db-connect: ## Connect to MySQL database
	@echo "$(BLUE)🔌 Connecting to MySQL...$(NC)"
	docker-compose exec mysql mysql -u root -proot123 academic_collaboration_db

db-backup: ## Backup database to ./backups/
	@mkdir -p backups
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S); \
	BACKUP_FILE="backups/backup_$$TIMESTAMP.sql"; \
	echo "$(YELLOW)💾 Backing up database to $$BACKUP_FILE...$(NC)"; \
	docker-compose exec -T mysql mysqldump -u root -proot123 academic_collaboration_db > $$BACKUP_FILE; \
	echo "$(GREEN)✅ Backup completed!$(NC)"

db-restore: ## Restore database from backup
	@echo "$(BLUE)📂 Available backups:$(NC)"
	@ls -1 backups/*.sql 2>/dev/null || echo "$(RED)No backups found$(NC)"
	@echo ""
	@read -p "Enter backup filename: " BACKUP; \
	echo "$(RED)⚠️  WARNING: This will overwrite the current database!$(NC)"; \
	read -p "Type 'yes' to continue: " CONFIRM; \
	if [ "$$CONFIRM" = "yes" ]; then \
		echo "$(YELLOW)📥 Restoring from $$BACKUP...$(NC)"; \
		cat backups/$$BACKUP | docker-compose exec -T mysql mysql -u root -proot123 academic_collaboration_db; \
		echo "$(GREEN)✅ Restore completed!$(NC)"; \
	fi

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "$(RED)⚠️  WARNING: This will DELETE ALL DATA!$(NC)"
	@read -p "Type 'DELETE' to confirm: " CONFIRM; \
	if [ "$$CONFIRM" = "DELETE" ]; then \
		echo "$(YELLOW)🔄 Resetting database...$(NC)"; \
		docker-compose exec -T mysql mysql -u root -proot123 -e "DROP DATABASE IF EXISTS academic_collaboration_db; CREATE DATABASE academic_collaboration_db;"; \
		cat database-schema.sql | docker-compose exec -T mysql mysql -u root -proot123 academic_collaboration_db; \
		echo "$(GREEN)✅ Database reset completed!$(NC)"; \
	fi

# Maintenance
clean: ## Remove stopped containers and images
	@echo "$(YELLOW)🧹 Cleaning up stopped containers and images...$(NC)"
	docker-compose down --remove-orphans
	docker image prune -f
	@echo "$(GREEN)✅ Cleanup completed!$(NC)"

clean-all: ## Remove everything (containers, volumes, images)
	@echo "$(RED)⚠️  WARNING: This will remove ALL containers, volumes, and images!$(NC)"
	@read -p "Type 'DELETE' to confirm: " CONFIRM; \
	if [ "$$CONFIRM" = "DELETE" ]; then \
		echo "$(YELLOW)🧹 Removing everything...$(NC)"; \
		docker-compose down -v --remove-orphans; \
		docker system prune -af --volumes; \
		echo "$(GREEN)✅ Complete cleanup done!$(NC)"; \
	fi

prune: ## Clean unused Docker resources
	@echo "$(YELLOW)🧹 Cleaning unused Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✅ Prune completed!$(NC)"

# Utilities
shell: ## Open shell in backend container
	@echo "$(BLUE)💻 Opening shell in backend container...$(NC)"
	docker-compose exec backend sh

db-shell: ## Open MySQL shell
	@echo "$(BLUE)💻 Opening MySQL shell...$(NC)"
	docker-compose exec mysql mysql -u root -proot123 academic_collaboration_db

phpmyadmin: ## Start phpMyAdmin on port 8080
	@echo "$(BLUE)🌐 Starting phpMyAdmin...$(NC)"
	docker-compose --profile tools up -d phpmyadmin
	@echo "$(GREEN)✅ phpMyAdmin running at http://localhost:8080$(NC)"

test: ## Run tests in container
	@echo "$(BLUE)🧪 Running tests in container...$(NC)"
	docker-compose exec backend npm test

version: ## Show Docker and app versions
	@echo "$(BLUE)📦 Version Information:$(NC)"
	@echo "  Docker:       $$(docker --version)"
	@echo "  Compose:      $$(docker-compose --version)"
	@echo "  App:          Academic Collaboration Platform v1.0"
