.PHONY: help setup dev up down logs restart rebuild ps prod-up prod-down prod-logs prod-rebuild host-dev

UI_PORT   ?= 3000
API_PORT  ?= 5000
SITE_URL  ?= http://localhost:3000
ENV_FILE  ?= .env
COMPOSE       := docker compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD  := docker compose -f docker-compose.yml
COMPOSE_FLAGS := --remove-orphans
NUXT_PUBLIC_SITE_URL ?= $(SITE_URL)

export UI_PORT API_PORT NUXT_PUBLIC_SITE_URL

help: ## Show commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

setup: ## Create .env from .env.example if missing
	@test -f $(ENV_FILE) || (cp .env.example $(ENV_FILE) && echo "Created $(ENV_FILE) from .env.example")

dev: setup ## Docker dev stack with hot reload (foreground)
	$(COMPOSE) up --build $(COMPOSE_FLAGS)

up: setup ## Docker dev stack (detached)
	$(COMPOSE) up --build -d $(COMPOSE_FLAGS)
	@echo "Dashboard (dev): http://localhost:$(UI_PORT)"

down: ## Stop dev Docker stack
	$(COMPOSE) down $(COMPOSE_FLAGS)

logs: ## Follow dev dashboard logs
	$(COMPOSE) logs -f dashboard

restart: ## Restart dev dashboard container
	$(COMPOSE) restart dashboard

rebuild: setup ## Force rebuild dev stack
	$(COMPOSE) up --build -d --force-recreate $(COMPOSE_FLAGS)

ps: ## Show dashboard containers
	$(COMPOSE) ps

prod-up: setup ## Production image — build and run detached
	$(COMPOSE_PROD) up --build -d $(COMPOSE_FLAGS)
	@echo "Dashboard (prod): http://localhost:$(UI_PORT)"

prod-down: ## Stop production dashboard
	$(COMPOSE_PROD) down $(COMPOSE_FLAGS)

prod-logs: ## Follow production dashboard logs
	$(COMPOSE_PROD) logs -f dashboard

prod-rebuild: setup ## Force rebuild production dashboard
	$(COMPOSE_PROD) up --build -d --force-recreate $(COMPOSE_FLAGS)

host-dev: setup ## Nuxt dev on host (requires pnpm)
	pnpm dev --port $(UI_PORT)
