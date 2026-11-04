# EstatePro — premium real estate marketplace

A full-stack property marketplace: cinematic marketing site, working search with filters,
dynamic property pages, user dashboard, seven-step listing wizard with image uploads,
and a role-protected admin dashboard. Fully bilingual (English / Persian with RTL).

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 + Vite (dev server on port 3000) |
| API | Express 4 (Node 22, ESM) on port 4000 |
| Database | PostgreSQL 16, plain SQL schema (`server/schema.sql`) |
| Maps | Leaflet + OpenStreetMap tiles (no API key) |
| Auth | Server sessions in Postgres, HTTP-only signed cookie, scrypt password hashes |

Vite proxies `/api` and `/uploads` to the API, so the whole app is served from a single
origin — session cookies need no CORS configuration.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- Web: http://localhost:3000
- API health: http://localhost:3000/api/health

The API applies `schema.sql` (idempotent) on boot and seeds demo content the first time
the `properties` table is empty.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@estatepro.dev` | `Admin1234` |
| Agent | `agent@estatepro.dev` | `Agent1234` |
| Buyer | `demo@estatepro.dev` | `Demo1234` |

## Feature map

- **Marketing home** — hero with advanced search, categories, why-us, featured (tabbed),
  luxury collection, developments, locations, how-it-works, latest, testimonials, FAQ, CTA.
- **Search** — `/properties` with buy/rent, type, city, neighborhood, price, beds, baths,
  area, furnishing, new, verified, featured filters, five sort orders, grid/list toggle,
  map view, active-filter chips, pagination, empty state.
- **Property page** — gallery + lightbox, specs, amenity list, OSM map, agent card with
  WhatsApp/call/inquiry/viewing, similar properties, mobile sticky contact bar.
- **Listing wizard** — `/sell`, seven steps with validation, real image uploads, cover
  selection, preview, then `pending` status awaiting admin review.
- **Dashboard** — overview KPIs, favorites, my listings (edit/delete), inquiries, recently
  viewed, account settings (profile + password).
- **Admin** — overview KPIs and activity, property approval/moderation/create/edit,
  users (roles, suspension), agents, inquiries with internal notes, categories, cities and
  neighborhoods, homepage copy + sections, site settings/SEO, review moderation, reports.
- **i18n** — `EN`/`فا` switch in the header; Persian switches the document to `dir="rtl"`
  and the Vazirmatn typeface.

## Notes on configuration

- No third-party credentials are required to run the app. Property locations use public
  OpenStreetMap tiles and photography is loaded from Unsplash.
- Password reset generates a secure token. No mail transport is configured in this
  environment, so the reset link is returned to the interface instead of being emailed —
  wire an SMTP provider and send it from `POST /api/auth/forgot-password` to complete it.
- `SESSION_SECRET` is read from the environment. A development placeholder lives in
  `.env.base44-defaults`; production values should come from the platform secret store.
