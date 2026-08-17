# AFM production deployment

AFM runs as a Next.js standalone Node application with PostgreSQL for durable application data and Cloudflare R2 for images and video.

## Required services

1. A PostgreSQL database with TLS enabled.
2. A Cloudflare R2 bucket.
3. A public R2 custom domain for published portfolio media.
4. A Node.js 22-compatible container or application host.

## Environment

Copy `.env.example` to `.env.local` for local development. Configure the same variables in the production host's secret manager. Never prefix database, session, or R2 credentials with `NEXT_PUBLIC_`.

Use a different database, session secret, R2 access key, and preferably a different bucket for preview environments. `APP_URL` and `ALLOWED_ORIGINS` must contain the exact deployed HTTPS origin.

## Cloudflare R2 setup

- Create a bucket named to match `R2_BUCKET_NAME`.
- Create an API token scoped only to object read/write for that bucket.
- Attach a custom public domain and set it as `R2_PUBLIC_BASE_URL`.
- Configure bucket CORS for the production and preview application origins.
- Allow `PUT`, `GET`, and `HEAD` and the `Content-Type` header.
- Do not expose the S3 API credentials or account ID to browser code.

Example CORS policy:

```json
[
  {
    "AllowedOrigins": ["https://app.example.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Database

Run the checked-in database migration command once for each environment before starting the new application version. The application account should own only the AFM schema and should not be a PostgreSQL superuser.

Back up the production database daily and test restoration before launch. R2 object lifecycle cleanup is application-managed; do not configure a blanket bucket expiry rule for published media.

## Docker Compose (app + Postgres + migrations)

`docker-compose.yml` runs the full stack: a `postgres:17` database with a named
volume, a one-shot `migrate` service that applies the checked-in Drizzle
migrations (Dockerfile target `migrator`), and the standalone app, which only
starts after migration succeeds.

```bash
# 1. Create .env next to docker-compose.yml with at minimum:
#    POSTGRES_PASSWORD=…            (required)
#    UPLOAD_TICKET_SECRET=…         (required, 32+ chars)
#    R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY /
#    R2_BUCKET_NAME / R2_PUBLIC_BASE_URL   (required for uploads)
#    APP_PORT=3000  APP_URL=…  ALLOWED_ORIGINS=…
docker compose up -d --build
docker compose ps          # db healthy, migrate exited (0), app healthy
docker compose logs app
```

The app boots and serves without valid R2 values, but uploads fail until real
credentials and the bucket CORS rule exist. `STORAGE_DRIVER=local` is refused
in production images by design.

## Coolify

Create a resource from this Git repository with the **Docker Compose** build
pack pointed at `docker-compose.yml`. The `app` service carries the
`SERVICE_FQDN_APP` magic variable, so Coolify treats it as the HTTP entrypoint:

1. **Domain** — on the app service, set your domain (e.g.
   `https://folio.example.com`). Coolify's proxy terminates TLS and forwards
   the original host headers, which the CSRF guard relies on. Container port
   is 3000.
2. **Environment** — set in Coolify's env UI: `POSTGRES_PASSWORD`,
   `UPLOAD_TICKET_SECRET` (32+ chars), the five `R2_*` values, and
   `APP_URL`/`ALLOWED_ORIGINS` matching the domain. Do not set
   `STORAGE_DRIVER`.
3. **R2 CORS** — add the production origin to the bucket's CORS rule
   (browser uploads PUT directly to R2):

   ```bash
   curl -X PUT "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/r2/buckets/<BUCKET>/cors" \
     -H "Authorization: Bearer <R2_API_TOKEN>" -H "Content-Type: application/json" \
     -d '{"rules":[{"allowed":{"origins":["https://folio.example.com"],"methods":["GET","PUT","HEAD"],"headers":["Content-Type"]},"exposeHeaders":["ETag"],"maxAgeSeconds":3600}]}'
   ```

   For production delivery, prefer a custom domain on the bucket over the
   rate-limited `r2.dev` URL and update `R2_PUBLIC_BASE_URL` accordingly.
4. **Migrations** — the one-shot `migrate` service runs on every deploy before
   the app starts; Drizzle migrations are idempotent.
5. The Postgres volume (`afm-db-data`) persists across deploys; use Coolify's
   scheduled backups for it.

`docker-compose.override.yml` only adds a host port for local runs — Coolify
ignores it.

## Single container (external database)

```bash
docker build -t afm-portfolio .
docker run --env-file .env.production -p 3000:3000 afm-portfolio
```

Terminate TLS at the platform load balancer, forward the original host/protocol headers, and run at least one instance. Session state is stored in PostgreSQL so additional instances may be added without sticky sessions.

## Release checks

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

Then verify signup, login, onboarding, an R2 image upload, an R2 video upload, autosave, preview, publish, and the public URL against the production services.
