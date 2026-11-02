# Mimir Dashboard

Visualization layer for the [Mimir](https://github.com) personal finance API. Browse period summaries, manage transactions and categories, and sign in through a JWT session proxied by Nuxt (no token in the browser).

Built with [Nuxt UI](https://ui.nuxt.com) on Nuxt 4.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io)
- A running Mimir API instance (OpenAPI reference: `server/api/template/mimir-openapi(3).json`)

## Setup

```bash
pnpm install
cp .env.example .env
```

Set the backend URL in `.env`:

```bash
NUXT_MIMIR_API_BASE_URL=http://localhost:5000
```

Paths are forwarded as documented in the OpenAPI file (`/auth/login`, `/transactions`, `/summary`, …).

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/login`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Vue/TS check |

## App map

| Route | Purpose |
|-------|---------|
| `/` | Overview — period totals, category breakdown, monthly table, recent transactions |
| `/transactions` | List, filter, create, edit, delete transactions |
| `/categories` | List and create categories |
| `/account` | Profile and logout |
| `/login`, `/register` | Authentication |

## Architecture

The browser calls `/api/mimir/*` on the Nuxt server. Nitro forwards requests to `NUXT_MIMIR_API_BASE_URL` and attaches `Authorization: Bearer …` from an httpOnly `mimir-token` cookie set on login/register.

Branding uses `public/logo.png` (smoke white, green, and black) with light mode as the default.

## License

See [LICENSE](LICENSE).
