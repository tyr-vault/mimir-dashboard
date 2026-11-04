.PHONY: help setup dev up down logs restart rebuild ps prod-up prod-down prod-logs prod-rebuild host-dev stop-host-prod

UI_PORT   ?= 3000
API_PORT  ?= 5000
SITE_URL  ?= http://localhost:3000
ENV_FILE  ?= .env
HOMELAB_NETWORK ?= homelab
COMPOSE       := docker compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_FLAGS := --remove-orphans
NUXT_PUBLIC_SITE_URL ?= $(SITE_URL)
PID_FILE      := .prod-server.pid

export UI_PORT API_PORT NUXT_PUBLIC_SITE_URL HOMELAB_NETWORK

# Attach to external Caddy network when it exists (see docker-compose.homelab-network.yml)
HAS_HOMELAB   := $(shell docker network inspect $(HOMELAB_NETWORK) >/dev/null 2>&1 && echo 1)
COMPOSE_PROD  := docker compose -f docker-compose.yml $(if $(HAS_HOMELAB),-f docker-compose.homelab-network.yml,)

help: ## Show commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

setup: ## Create .env from .env.example if missing
	@test -f $(ENV_FILE) || (cp .env.example $(ENV_FILE) && echo "Created $(ENV_FILE) from .env.example")

stop-host-prod: ## Stop legacy host Nitro process (frees :$(UI_PORT))
	@if [ -f $(PID_FILE) ]; then \
		kill $$(cat $(PID_FILE)) 2>/dev/null || true; \
		rm -f $(PID_FILE); \
		echo "Stopped host prod (PID file)."; \
	fi

dev: setup ## Docker dev stack with hot reload (foreground)
	$(COMPOSE) up --build $(COMPOSE_FLAGS)

up: setup stop-host-prod ## Docker dev stack (detached)
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

prod-up: setup stop-host-prod ## Production image — build and run detached
	@if [ "$(HAS_HOMELAB)" = "1" ]; then \
		echo "Using Docker network $(HOMELAB_NETWORK) (Caddy: reverse_proxy mimir-dashboard:3000)"; \
	else \
		echo "Network $(HOMELAB_NETWORK) not found — publishing :$(UI_PORT) only (Caddy on host: reverse_proxy 127.0.0.1:$(UI_PORT))"; \
	fi
	$(COMPOSE_PROD) up --build -d $(COMPOSE_FLAGS)
	@docker ps --filter name=mimir-dashboard --format 'Container {{.Names}}: {{.Status}}'
	@echo "Dashboard (prod): http://127.0.0.1:$(UI_PORT)"

prod-down: ## Stop production dashboard
	$(COMPOSE_PROD) down $(COMPOSE_FLAGS)

prod-logs: ## Follow production dashboard logs
	$(COMPOSE_PROD) logs -f dashboard

prod-rebuild: setup stop-host-prod ## Force rebuild production dashboard
	$(COMPOSE_PROD) up --build -d --force-recreate $(COMPOSE_FLAGS)

host-dev: setup ## Nuxt dev on host (requires pnpm)
	pnpm dev --port $(UI_PORT)
