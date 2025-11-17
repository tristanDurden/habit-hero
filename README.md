## Habit Hero

Habit Hero is a Next.js application for tracking and visualising habit progress.
It uses Prisma with a MySQL database and ships with a `docker-compose.yml` file to
spin up the database locally or in a self-hosted deployment.

---

## Requirements

- Node.js 20+
- npm 10+ (or your preferred package manager)
- Docker Desktop (or any OCI-compatible runtime) for the MySQL container

---

## Environment variables

Create a `.env` file at the project root with (minimum) the following content:

```
DATABASE_URL="mysql://habituser:habitpass123@localhost:3306/habit_app_db"
NEXTAUTH_SECRET="replace-with-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

Adjust `DATABASE_URL` if you change any values in `docker-compose.yml` or deploy
to a managed database provider.

---

## Database setup (Docker)

1. Ensure Docker is running.
2. Start the MySQL service defined in `docker-compose.yml`:

   ```bash
   docker compose up -d db
   ```

   This uses the credentials declared in the compose file:
   - user: `habituser`
   - password: `habitpass123`
   - database: `habit_app_db`

3. Run the Prisma migrations against the running database:

   ```bash
   npx prisma migrate deploy
   ```

4. (Optional) Seed data if you add a seeding script later:

   ```bash
   npm run seed
   ```

---

## Local development

```bash
npm install
npm run dev
```

The app is now available at [http://localhost:3000](http://localhost:3000).

---

## Production build

```bash
npm run build
npm run start
```

Ensure the `.env` variables (especially `DATABASE_URL` and `NEXTAUTH_SECRET`) are
set in your deployment environment.

---

## Deploying Habit Hero

### Option A: Self-host with Docker Compose

1. Provision a VM with Docker + Node.js installed.
2. Copy the project files (including `docker-compose.yml`) to the server.
3. Update `.env` with production-ready secrets and your public `NEXTAUTH_URL`.
4. Start the database: `docker compose up -d db`.
5. Install dependencies and build the app: `npm install && npm run build`.
6. Run migrations against the compose database: `npx prisma migrate deploy`.
7. Start the app with a process manager (`npm run start`, `pm2`, `systemd`, etc.).
8. Add HTTPS via your preferred reverse proxy (Caddy, Nginx, Traefik).

### Option B: Managed hosting (Vercel, Render, etc.)

1. Deploy the Next.js app via the platform UI/CLI.
2. Provision a managed MySQL database (PlanetScale, RDS, Neon for MySQL, etc.).
3. Set the following environment variables in the hosting dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
4. Run `npx prisma migrate deploy` as a post-deploy step or via the provider’s
   migration runner.

---

## Useful scripts

- `npm run dev` – start the dev server
- `npm run build` – create a production build
- `npm run start` – run the built app
- `npx prisma migrate dev` – create & apply a new migration locally
- `npx prisma studio` – inspect the database via Prisma Studio

---

For additional details on Next.js tooling, refer to the
[official documentation](https://nextjs.org/docs).
