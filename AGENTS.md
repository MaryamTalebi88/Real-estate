# AGENTS.md — working notes for EstatePro

These are the non-obvious things; manifests and `README.md` cover the rest.

## Running the stack

```bash
docker compose -f docker-compose.base44.yml up -d --build   # project name is `app`
docker compose -f docker-compose.base44.yml ps
docker compose -f docker-compose.base44.yml logs -f api web
```

- `web` (Vite) owns host port 3000 and proxies `/api` and `/uploads` to `api:4000`.
  Keep that single-origin wiring: session cookies depend on it.
- `api` runs `node --watch-path=/app/server`, so server edits restart automatically.
  Frontend edits hot-reload through Vite.
- Dependencies install on container start into named volumes (`web-deps`, `api-deps`)
  from the committed `package-lock.json` files. If you add a package, run the install
  again or `docker compose restart <service>`.
- `uploads/` in the repo is only a mountpoint; images live in the `uploads` volume and are
  served by the API at `/uploads/<file>`.

## Database

- `server/schema.sql` is idempotent and applied on every boot from `server/db.js`.
- Demo content is seeded only when `properties` is empty (`server/seed.js`).
  To reseed, drop the `db-data` volume — never delete it casually, user data lives there.
- Prices/areas are `NUMERIC`; `server/lib/properties.js#mapProperty` converts them to
  numbers before they reach the client. Keep that conversion when adding endpoints.
- Search filters are built in one place: `buildPropertyFilters()` in the same file.
  Public requests are pinned to `status = 'active'`; admin requests may pass `status`.

## Localisation

- UI strings: `src/lib/i18n.jsx` (`en` + `fa` dictionaries). Missing keys fall back to the
  English entry, then the key itself.
- Editable site copy (hero, why-us, featured headings, stats, FAQ) lives in
  `site_settings.data` with parallel `…Fa` fields; the admin Homepage module edits both.
  Components read e.g. `lang === 'fa' ? settings.heroHeadingFa : settings.heroHeading`.
- Use logical CSS properties (`padding-inline`, `inset-inline`) — the layout is served LTR
  and RTL from the same stylesheet. Directional icons flip via `.flip-rtl`.

## Auth & roles

- Sessions: `sessions` table + `ep_session` HTTP-only cookie, HMAC-signed in
  `server/auth.js`. `attachUser` runs on every request; `requireRole('admin')` guards
  `/api/admin/*`.
- Suspended users are rejected at login and existing sessions are deleted when an admin
  suspends an account.
- Every mutation that touches owned data checks ownership in the route (see
  `loadOwnedProperty` in `server/routes/account.js`).

## Verifying changes

- Health: `curl -s localhost:3000/api/health`
- Data smoke test: `curl -s 'localhost:3000/api/properties?limit=2'`
- In a container: `docker compose -f docker-compose.base44.yml exec -T api node -e "..."`

Manual flows worth re-checking after touching shared code:

1. Home in both languages (hero copy, RTL direction, no horizontal overflow at 375 px).
2. `/properties` — change city/beds/price, confirm count + chips update and the URL follows.
3. `/properties/<slug>` — gallery lightbox, favorite button, inquiry modal.
4. `/sell` as a signed-in user — upload a photo, submit, see the success screen.
5. `/admin` as `admin@estatepro.dev` — approve a pending listing, edit a property, reports.

## Sandbox specifics

- `vite.config.js` extends `server.allowedHosts` with `.${BASE44_SANDBOX_HOST_DOMAIN}`
  so the preview proxy host is accepted; the sandbox id rotates, so never hardcode it.
- No external credentials are needed. If you add an SMTP provider for password reset,
  declare the secret and append `/run/base44/app.env` as the last `env_file` entry.
