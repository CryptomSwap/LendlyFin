# Supabase data growth — cleanup and verification

After deploying the listing-image fixes, complete these steps in Supabase and production.

## 1. Confirm the problem (SQL Editor)

```sql
-- Table sizes
SELECT relname AS table, pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 15;

-- Base64 listing images (legacy — main disk culprit)
SELECT
  COUNT(*) AS image_rows,
  COUNT(*) FILTER (WHERE url LIKE 'data:image/%') AS base64_rows,
  pg_size_pretty(SUM(length(url))::bigint) AS url_bytes_total
FROM "ListingImage";
```

## 2. Reclaim disk after legacy base64 rows

**Option A — delete inline images only** (listing stays, photos lost until re-upload):

```sql
DELETE FROM "ListingImage" WHERE url LIKE 'data:image/%';
```

**Option B — full vacuum** (run during low traffic; may lock briefly):

```sql
VACUUM FULL "ListingImage";
```

Then check **Project Settings → Database** for size trending down over 24h.

## 3. Production environment (Vercel)

Listing uploads in production use the **same S3 bucket as KYC** (`KYC_S3_*` env vars). Confirm these are set:

- `KYC_S3_BUCKET`
- `AWS_REGION` or `KYC_S3_REGION`
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (or IAM role)

New photos are stored under `listings/` in that bucket and served via `/api/listings/images/...`.

## 4. Post-deploy checks

- [ ] Publish a test listing with photos — DB `ListingImage.url` should start with `listing-s3:` (not `data:image/`).
- [ ] Homepage and search show cover images.
- [ ] Listing detail carousel loads all photos.
- [ ] Supabase **database size** and **egress** daily charts flatten over 2–3 days.

## 5. Optional: migrate legacy base64 to S3

There is no automated migrator in-repo. For important listings, owners can re-upload photos from the manage flow, or you can run a one-off script that reads `data:image/` rows, uploads to S3, and updates `url` to `listing-s3:listings/{id}.jpg`.

## 6. Things to watch

- Do **not** run `npm run db:seed` or `qa:reset` against production `DATABASE_URL` (wipes data).
- Ensure `DEV_AUTH_BYPASS` is unset in production.
- In Supabase dashboard, distinguish **database size** vs **egress** — both should improve after deploy.
