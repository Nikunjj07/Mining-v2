# Deployment Configuration

This monorepo is deployed as separate services:

- Client: Vercel static deployment
- Server: Render web service (or equivalent Node host)
- Database: MongoDB Atlas

## 1. MongoDB Atlas Setup

1. Create an Atlas project and cluster.
2. Create a database user with read/write permissions.
3. Add IP allowlist for deployment provider.
4. Copy the connection string and set it as MONGODB_URI in server environment variables.

Connection format:

mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority

## 2. Backend Deployment (Render)

Use server/render.yaml as infrastructure configuration.

Required environment variables:

- NODE_ENV=production
- PORT=3000
- MONGODB_URI=<atlas-connection-string>
- JWT_SECRET=<min-32-char-secret>
- JWT_EXPIRES_IN=7d
- CORS_ORIGIN=<vercel-domain>
- RATE_LIMIT_WINDOW_MS=900000
- RATE_LIMIT_MAX_REQUESTS=100
- BCRYPT_SALT_ROUNDS=10

## 3. Frontend Deployment (Vercel)

Use client/vercel.json for rewrite configuration.

Required environment variables:

- VITE_API_URL=https://<backend-domain>/api

Build settings:

- Root directory: client
- Build command: npm run build
- Output directory: dist

## 4. Post-Deploy Validation

1. Verify backend health endpoint: GET /health
2. Verify login and protected routes.
3. Verify emergency create, assign, and status updates.
4. Verify hazard CRUD as admin.
5. Verify CORS by calling API from deployed frontend.
