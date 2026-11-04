# Mimir Dashboard

Visualization layer for the Mimir personal finance API. Browse period summaries, manage transactions and categories, and sign in through a JWT session proxied by Nuxt (no token in the browser).

Built with [Nuxt UI](https://ui.nuxt.com) on Nuxt 4.

## Docker (recommended)

Same pattern as `mimir-api` / `mimir-bot`: base `docker-compose.yml` (prod) + `docker-compose.dev.yml` (hot reload).

```bash
make setup
make dev          # foreground, port 3000
make up           # detached dev
make prod-up      # production Nitro server in Docker
make logs         # dev logs
make prod-logs    # prod logs
make down         # stop dev stack
make prod-down    # stop prod stack
```

Inside Docker, Nitro reaches the API at `http://host.docker.internal:5000` (override with `API_PORT` / root `.env`).

From the meta repo: `make dev ui` or `make prod ui`.

## Host development (optional)

Requires Node.js 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env
make host-dev
```

## Environment

| Variable | Purpose |
|----------|---------|
| `NUXT_MIMIR_API_BASE_URL` | Upstream API for Nitro proxy (see `.env.example`) |
| `NUXT_PUBLIC_SITE_URL` | Public dashboard URL |

## App map

| Route | Purpose |
|-------|---------|
| `/` | Overview — period totals, category breakdown, monthly table, recent transactions |
| `/transactions` | List, filter, create, edit, delete transactions |
| `/categories` | List and create categories |
| `/drafts` | Confirm or reject bot drafts |
| `/account` | Profile and logout |
| `/login`, `/register` | Authentication |

## Architecture

The browser calls `/api/mimir/*` on the Nuxt server. Nitro forwards requests to `NUXT_MIMIR_API_BASE_URL` and attaches `Authorization: Bearer …` from an httpOnly `mimir-token` cookie set on login/register.

## License

See [LICENSE](LICENSE).
