# PostgreSQL schema

The application uses Drizzle ORM with `postgres.js`. Set `DATABASE_URL` to a
PostgreSQL connection string before running database commands.

For a new database, apply the checked-in migration:

```sh
npx drizzle-kit migrate
```

After changing `db/schema.ts`, create and review a new migration:

```sh
npx drizzle-kit generate
```

Do not use `drizzle-kit push` against production. Deploy migrations as a
separate release step before starting the new application version. The runtime
database connection is initialized lazily, so `next build` does not require
database credentials.
