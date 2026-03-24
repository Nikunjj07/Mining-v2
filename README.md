# Industrial Disaster And Shift Coordination Platform

Monorepo for a coal-mine operations platform with role-based workflows for shift handovers, emergencies, hazards, notifications, and live personnel location updates.

## Stack

- Client: React, TypeScript, Vite, Tailwind CSS
- Server: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt
- Workspace: npm workspaces

## Monorepo Structure

- client: Frontend app
- server: Backend API

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (Atlas or local)

## Environment Variables

Create server/.env with the following keys:

- PORT: API port. Default 3000
- NODE_ENV: development, test, or production
- MONGODB_URI: MongoDB connection URI
- JWT_SECRET: secret key, minimum 32 characters
- JWT_EXPIRES_IN: token lifetime, default 7d
- CORS_ORIGIN: frontend origin, default http://localhost:5173
- RATE_LIMIT_WINDOW_MS: rate-limiter window in ms
- RATE_LIMIT_MAX_REQUESTS: max requests in the window
- BCRYPT_SALT_ROUNDS: bcrypt rounds, default 10

Example values are available in server/.env.example.

## Install

Run from repository root:

npm install

## Development

- Start both apps:

npm run dev

- Start frontend only:

npm run dev:client

- Start backend only:

npm run dev:server

## Build

- Build both workspaces:

npm run build

- Build frontend only:

npm run build:client

- Build backend only:

npm run build:server

## Test

- Backend smoke tests:

npm run test:server

- Frontend integration checks:

npm run test:client

## API Base URL

- Local backend URL: http://localhost:3000/api
- Frontend reads VITE_API_URL. If unset, it defaults to http://localhost:3000/api

## Seed Demo Data

Run from root:

npm run seed:server

Demo users are created for admin, supervisor, worker, and rescue roles.

## Deployment

Deployment configuration and environment guidance are documented in docs/DEPLOYMENT.md.

## API Contract

API route list, request and response examples, and role matrix are documented in docs/API_CONTRACT.md.