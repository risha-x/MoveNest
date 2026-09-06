# MoveNest

MoveNest is a moving-day organizer for rooms, boxes, items, packing progress, and item condition photos.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

Install dependencies from the repository root:

```sh
npm install
npm install --prefix Frontend
npm install --prefix Backend
```

Start the frontend and API together:

```sh
npm run dev:all
```

Open `http://localhost:5173`. The API runs at `http://localhost:4000` and exposes `GET /api/health` for a health check.

The local SQLite database is created at `Database/movenest.db` from `Backend/src/db/schema.sql`. The database file is ignored by Git.

## Useful commands

```sh
npm run build       # Build the frontend
npm run build:all   # Build the frontend and backend
npm run lint        # Run frontend lint checks
npm run start:server
```

## Project layout

- `Frontend/src/pages`: page-level views
- `Frontend/src/components`: reusable UI and modal components
- `Frontend/src/context`: shared application state and API mutations
- `Frontend/src/services`: frontend API client
- `Backend/src/routes`: HTTP route definitions
- `Backend/src/controllers`: request handlers
- `Backend/src/services`: database operations
- `Backend/src/db`: SQLite connection and schema
- `Database`: local runtime database files

## Production note

The local app currently uses a browser-stored user ID sent in the `x-user-id` header. Production deployment requires real authentication, secret management, a hosted database strategy, and a configured CORS origin.
