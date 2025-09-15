## Xeno Shopify Analytics (Multi-tenant)

End-to-end multi-tenant Shopify analytics platform:
- Backend API for ingestion and analytics (`xeno_shopify_backend`, Node.js, Express, Sequelize, PostgreSQL)
- Frontend dashboard (`xeno-dashboard`, Next.js + Tailwind + Recharts)
- Optional offline data scripts (`xeno_shopify`, Python utilities)

### Architecture
- **Multi-tenant data model** in PostgreSQL with tables: `tenants`, `customers`, `orders`, `products`.
- **Ingestion** via Shopify REST API using per-tenant `shopDomain` and `accessToken`.
- **Sync** on-demand (`POST /api/sync/trigger`) and scheduled hourly cron in production.
- **Tenant isolation** enforced by `x-tenant-id` header (middleware resolves `req.tenant` and `req.tenantId`).
- **Analytics endpoints** aggregate metrics per tenant (dashboard overview, orders by date, top customers, revenue trends).

### Repos and Key Paths
- Backend: `xeno_shopify_backend/`
  - Entry: `server.js`
  - Config: `config/database.js`
  - Models: `models/*.js`
  - Routes: `routes/{index,tenants,sync,analytics}.js`
  - Controllers: `controllers/*.js`
  - Services: `services/{shopifyService,syncService}.js`
  - Scripts: `scripts/{seedDemoData,syncShopifyData,cronJobs}.js`
- Frontend: `xeno-dashboard/`
  - Next.js app using Tailwind and Recharts
  - Components: `components/{XenoLandingPage,XenoDashboard}.js`
  - Hooks: `hooks/useAnalytics.js`
- Python utilities (optional): `xeno_shopify/` (`checkout.py`, `orders.py`, CSVs)

### Backend API
- Base URL: `http://<backend-host>:<port>`
- Health: `GET /health`
- Tenants: `GET /api/tenants`, `GET /api/tenants/:id`, `POST /api/tenants`, `PUT /api/tenants/:id`, `DELETE /api/tenants/:id`
- Sync (requires `x-tenant-id`):
  - `POST /api/sync/trigger`
  - `GET /api/sync/status`
- Analytics (requires `x-tenant-id`):
  - `GET /api/analytics/dashboard`
  - `GET /api/analytics/top-customers?limit=5`
  - `GET /api/analytics/orders-by-date?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - `GET /api/analytics/revenue-trends?period=30` (days)

Request header for tenant-scoped endpoints:
```
x-tenant-id: <UUID of tenant>
```

### Environment Variables
Create a `.env` in `xeno_shopify_backend/`:
```
# Node
NODE_ENV=development
PORT=3000

# Postgres (dev)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=12345
DB_NAME=xeno_shopify

# Production (set either this or the above group)
# DATABASE_URL=postgres://user:pass@host:5432/dbname

# Shopify
SHOPIFY_API_VERSION=2024-10

# Demo seeding (optional, provide valid tokens/domains or leave unset)
DEMO_SHOPIFY_STORE_1=
DEMO_SHOPIFY_TOKEN_1=
DEMO_SHOPIFY_STORE_2=
DEMO_SHOPIFY_TOKEN_2=

# CORS
FRONTEND_URL=
```

Frontend `.env` in `xeno-dashboard/`:
```
NEXT_PUBLIC_API_URL=https://<backend-domain-or-vercel-function>
NEXT_PUBLIC_TENANT_ID=<tenant-uuid>
```

Note: In `xeno-dashboard/components/XenoDashboard.js` and `components/XenoLandingPage.js`, the API base is hardcoded to `http://localhost:3000`. For production, set `NEXT_PUBLIC_API_URL` and update those components to use it, or deploy backend under that hostname.

### Local Development
Prereqs: Node 18+, npm, and PostgreSQL 14+.

1) Backend
```
cd xeno_shopify_backend
npm install
cp .env.example .env  # if you maintain one; otherwise create .env from above
npm run dev
```
Verify: `GET http://localhost:3000/health` returns running JSON.

Create a tenant (use valid Shopify creds):
```
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "shopDomain": "your-store.myshopify.com",
    "accessToken": "shpat_...",
    "storeName": "Your Store"
  }'
```

Trigger sync for that tenant:
```
curl -X POST http://localhost:3000/api/sync/trigger \
  -H "x-tenant-id: <TENANT_ID_FROM_RESPONSE>"
```

2) Frontend
```
cd xeno-dashboard
npm install
echo NEXT_PUBLIC_API_URL=http://localhost:3000 > .env.local
echo NEXT_PUBLIC_TENANT_ID=<TENANT_ID> >> .env.local
npm run dev
```
Open: http://localhost:3001

### Production Deployment (Vercel + Managed Postgres)

You can deploy both frontend and backend to Vercel. The backend runs as a Node server with Express; use Vercel’s Node Serverless Functions or a long-running Node server via the Vercel Node runtime. Since this app listens on a port, the simplest approach is:

- Deploy backend to a Node host that supports listening (e.g., Render, Railway, Fly.io, or a Vercel-compatible serverless adapter). If you must use Vercel only, wrap Express routes as serverless functions. Below are two workable options.

Option A: Deploy backend to Render/Railway/Fly (recommended)
1) Provision PostgreSQL and get `DATABASE_URL`.
2) Deploy `xeno_shopify_backend/`:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: set `NODE_ENV=production`, `DATABASE_URL`, `SHOPIFY_API_VERSION`, `FRONTEND_URL`.
   - Ensure `enable SSL` for Postgres; backend already sets `ssl: { require: true, rejectUnauthorized: false }` in production.
3) Note the backend base URL, e.g. `https://api.example.com`.
4) In Vercel frontend project settings, set `NEXT_PUBLIC_API_URL=https://api.example.com` and `NEXT_PUBLIC_TENANT_ID=<id>`.

Option B: Vercel-only (convert Express to serverless)
If you need everything on Vercel:
1) Create a new Vercel project from `xeno_shopify_backend/` and refactor routes into `api/*` serverless functions. Each Express route handler becomes an exported function using Vercel’s request/response. Move Sequelize init to a shared module and reuse per function. Disable `app.listen`.
2) Alternatively, use a community Express-to-serverless wrapper. Note: Cron (`node-cron`) will not persist in serverless; replace with Vercel Cron Jobs hitting a sync endpoint on a schedule.
3) Configure Vercel Postgres or external Postgres. Set `DATABASE_URL` in Vercel Environment Variables. Enable SSL.
4) Update frontend `NEXT_PUBLIC_API_URL` to the Vercel backend URL (e.g., `https://<backend-project>.vercel.app`).

Frontend (Vercel) deployment
1) Create a new Vercel project from `xeno-dashboard/`.
2) Set Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://<your-backend-host>`
   - `NEXT_PUBLIC_TENANT_ID=<your-tenant-uuid>`
3) Build command: `npm run build`
4) Output: Next.js (defaults are fine). Start is handled by Vercel.
w
### Database
- In dev, Sequelize auto-syncs models (`sequelize.sync({ alter: true })`). For production, keep `alter` on only if you accept online schema changes; otherwise manage migrations via `sequelize-cli`.
- Production config reads `DATABASE_URL` and enables SSL.

### Cron / Scheduled Sync
- In production code path, `scripts/cronJobs.js` runs hourly. This requires a persistent Node process.
- On Vercel, replace with Vercel Cron Jobs hitting a public endpoint (e.g., `POST /api/sync/trigger`) per tenant or a custom admin endpoint.

### Security and CORS
- `helmet` and `express-rate-limit` are configured on `/api/*`.
- CORS allows `FRONTEND_URL` and common dev hosts. For Vercel, wildcards for `*.vercel.app` are supported via regex in config.

### Testing Data (Demo)
Run seed with real or demo tokens (if you have a test store):
```
cd xeno_shopify_backend
npm run seed
```

### Known Notes / Minor Fixes
- `scripts/syncShopifyData.js` imports `{ Tenant }` using `.default`. Change to `const { Tenant } = require('../models');` and similarly for the direct run path.
- Frontend components `XenoDashboard.js` and `XenoLandingPage.js` hardcode `http://localhost:3000`. Consider reading `process.env.NEXT_PUBLIC_API_URL` instead.

### License
MIT


