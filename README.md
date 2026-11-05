# Siklus Web

Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui (Radix Nova), and pnpm. The interface is in Indonesian.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Open http://localhost:3000. Run NestJS separately and apply its PostgreSQL migrations first. Set `BACKEND_URL` to the NestJS base URL without a path. Behind a reverse proxy, set `WEB_ORIGIN` to the public HTTPS origin for cookie and origin validation.

The Next.js route handler forwards the allowlisted requests to NestJS. Access and refresh tokens stay in HttpOnly cookies. NestJS remains responsible for resource permissions and report validation. Email verification requires SMTP. Report upload requires R2. Predictions display when the FastAPI model is available.

```sh
pnpm build
pnpm start
```

## Report maps

Leaflet displays report coordinates with OpenStreetMap tiles and attribution. Tile rendering requires internet access. Coordinates remain available if the tile service is unreachable. For a larger deployment, choose a tile provider or self-hosted service that supports the expected usage and update the tile attribution accordingly. See the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
