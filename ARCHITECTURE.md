# Industrial Disaster Platform - Architecture and Workflow Guide

This document explains how the full system works end-to-end: user workflows, API/data flow, backend logic, frontend state flow, and file responsibilities.

## 1. System Overview

The platform is a monorepo with two runtime applications:

- Client app: React + TypeScript + Vite
- Server app: Node.js + Express + TypeScript + MongoDB (Mongoose)

Primary goals:

- Digital shift handover
- Emergency reporting and assignment lifecycle
- Hazard management
- Role-based access control
- Dashboard visibility
- Notification and map/location support

## 2. Runtime Architecture

### 2.1 Client (Browser)

Responsibilities:

- Render role-specific pages and dashboards
- Collect form input and validate basic UI constraints
- Call REST endpoints through shared API client
- Store JWT token in localStorage
- Poll notifications/emergencies for near-realtime updates

Entry and core composition:

- App routing and guards: client/src/App.tsx
- Auth state provider: client/src/context/AuthContext.tsx
- Polling/realtime context: client/src/context/RealtimeContext.tsx
- Shared HTTP client: client/src/services/api.client.ts

### 2.2 Server (API)

Responsibilities:

- Validate incoming payloads
- Enforce authentication and role authorization
- Execute business logic and persistence
- Return consistent JSON responses
- Rate-limit sensitive endpoints
- Emit request tracing logs with requestId

Bootstrap and middleware flow:

- App factory: server/src/app.ts
- Server startup and DB connect: server/src/server.ts
- Request tracing middleware: server/src/middleware/requestContext.middleware.ts
- Error handling middleware: server/src/middleware/error.middleware.ts

### 2.3 Database (MongoDB)

Collections include:

- users
- shift_logs
- shift_acknowledgements
- emergencies
- hazards
- notifications
- user_locations

Models:

- server/src/models/User.model.ts
- server/src/models/ShiftLog.model.ts
- server/src/models/ShiftAcknowledgement.model.ts
- server/src/models/Emergency.model.ts
- server/src/models/Hazard.model.ts
- server/src/models/Notification.model.ts
- server/src/models/UserLocation.model.ts

## 3. Request Lifecycle (Technical Flow)

For every protected API request:

1. Client service calls endpoint via api.client.ts.
2. JWT is attached as Authorization header by request interceptor.
3. Server receives request and assigns/propagates requestId.
4. Auth middleware validates token and resolves req.user.
5. Role middleware enforces access where applicable.
6. Validation middleware checks params/body/query schemas.
7. Controller executes business logic and DB operations.
8. Response is returned as JSON.
9. Request completion is logged with method/path/status/duration/requestId.
10. Any thrown error is normalized by centralized error handler.

## 4. Authentication and Authorization Flow

### 4.1 Signup/Login

- Signup endpoint creates user with bcrypt-hashed password.
- Self-registration as admin is blocked.
- Login verifies password and returns JWT token.
- Token includes userId and role.

Key files:

- Routes: server/src/routes/auth.routes.ts
- Controller: server/src/controllers/auth.controller.ts
- Validator: server/src/validators/auth.validator.ts
- JWT utils: server/src/utils/jwt.util.ts
- Password rules/hashing: server/src/models/User.model.ts

### 4.2 Frontend Auth State

- Token is persisted in localStorage.
- On load, AuthContext calls /auth/me to hydrate user.
- ProtectedRoute redirects to login or unauthorized when needed.

Key files:

- client/src/context/AuthContext.tsx
- client/src/components/ui/ProtectedRoute.tsx

## 5. Business Workflows

### 5.1 Shift Workflow

User journey:

1. Supervisor/worker creates shift log.
2. Shift appears in history/recent lists.
3. Next user acknowledges shift.
4. Acknowledgement record is written and shift.acknowledged becomes true.

Server files:

- Route: server/src/routes/shift.routes.ts
- Controller: server/src/controllers/shift.controller.ts
- Validator: server/src/validators/shift.validator.ts

Client files:

- Service: client/src/services/shift.service.ts
- Create page: client/src/pages/Shift/Create/ShiftCreate.tsx
- History page: client/src/pages/Shift/History/ShiftHistory.tsx
- Dashboard usage: client/src/pages/Dashboard/Supervisor/SupervisorDashboard.tsx

### 5.2 Emergency Workflow

User journey:

1. Any authenticated user reports emergency.
2. Admin views emergency queue with filters.
3. Admin assigns rescue user.
4. Assigned rescue updates status through in_progress to resolved.
5. Notifications are generated for relevant users.

Server files:

- Route: server/src/routes/emergency.routes.ts
- Controller: server/src/controllers/emergency.controller.ts
- Validator: server/src/validators/emergency.validator.ts

Client files:

- Service: client/src/services/emergency.service.ts
- Create page: client/src/pages/Emergency/Create/EmergencyCreate.tsx
- Manage page: client/src/pages/Emergency/Manage/EmergencyManage.tsx
- Rescue dashboard: client/src/pages/Dashboard/Rescue/RescueDashboard.tsx

### 5.3 Hazard Workflow

User journey:

1. Admin creates hazard record.
2. Hazards are listed with risk/status filters.
3. Admin edits mitigation/status/review data.
4. Admin can delete hazard.

Important consistency:

- Field naming is normalized to hazard_name across API and UI.
- Route path is standardized as /hazards/manage in frontend routing/navigation.

Server files:

- Route: server/src/routes/hazard.routes.ts
- Controller: server/src/controllers/hazard.controller.ts
- Validator: server/src/validators/hazard.validator.ts
- Model: server/src/models/Hazard.model.ts

Client files:

- Service: client/src/services/hazard.service.ts
- Page: client/src/pages/Hazards/Manage/HazardManage.tsx

### 5.4 Notification Workflow

Flow:

1. Domain actions call notification service on server.
2. Client polls unread count and latest notifications.
3. Notification bell shows unread badge and list.
4. User marks one/all as read.

Server files:

- Route: server/src/routes/notification.routes.ts
- Controller: server/src/controllers/notification.controller.ts
- Service: server/src/services/notification.service.ts

Client files:

- Service: client/src/services/notification.service.ts
- Context: client/src/context/RealtimeContext.tsx
- UI: client/src/components/ui/NotificationBell.tsx

### 5.5 Location/Map Workflow

Flow:

1. Browser geolocation hook captures position.
2. Background tracker sends periodic updates.
3. API stores latest active positions.
4. Map page fetches and renders personnel markers.

Server files:

- Route: server/src/routes/location.routes.ts
- Controller: server/src/controllers/location.controller.ts

Client files:

- Hook: client/src/hooks/useGeolocation.ts
- Tracker: client/src/components/LocationTracker.tsx
- Service: client/src/services/location.service.ts
- Map page/components: client/src/pages/Map/LiveMap.tsx and map components

## 6. Frontend File Usage Guide

### 6.1 Routing and Access

- App-level route map: client/src/App.tsx
- Sidebar navigation links by role: client/src/components/ui/Sidebar.tsx
- Access enforcement: client/src/components/ui/ProtectedRoute.tsx

### 6.2 Services Layer (API Boundary)

All REST interaction should go through service modules:

- api.client.ts (shared axios config + auth header)
- shift.service.ts
- emergency.service.ts
- hazard.service.ts
- notification.service.ts
- location.service.ts

Rule of thumb:

- UI components/pages do not call fetch/axios directly.
- They call services and react to returned domain data.

### 6.3 Pages vs Components

- pages: route-level orchestration and data loading
- components/ui: reusable visual and interaction units
- components/map: map-specific rendering pieces

## 7. Backend File Usage Guide

### 7.1 Layering Convention

- routes: HTTP path + middleware composition only
- validators: zod schemas and input contract
- controllers: business logic and orchestration
- models: schema/index definition and DB behavior
- middleware: cross-cutting concerns
- utils: small reusable technical helpers

### 7.2 Middleware Order in App

Current order in app.ts:

1. helmet + cors
2. requestContext (requestId + logs)
3. body parsers
4. health endpoint
5. API rate limiter
6. feature routes
7. 404 handler
8. error handler

This order ensures request IDs and security/rate-limits are applied before controllers execute.

## 8. Data Flow Details by Direction

### 8.1 Client to Server

- DTO-like payloads are constructed from form state.
- Services call endpoint.
- JWT header auto-injected by interceptor.

### 8.2 Server to Database

- Controller builds filter/update object.
- Mongoose model executes create/find/update/delete.
- Optional population enriches relational references.

### 8.3 Server to Client

- JSON response returns domain object(s) + optional pagination/message.
- Error responses include normalized shape and requestId for tracing.

## 9. Security Model

Implemented controls:

- Helmet security headers
- CORS allowlist origin
- Auth and emergency rate limiting
- JWT auth middleware on protected routes
- Role-based authorization middleware
- Input validation on write and filter endpoints
- Password hashing with bcrypt

## 10. Testing and Quality Flow

### 10.1 Backend Smoke Tests

Coverage currently validates:

- Auth flow (signup/login/me)
- Emergency lifecycle
- Shift acknowledgement
- Hazard CRUD

File:

- server/src/tests/smoke.test.ts

### 10.2 Frontend Integration Checks

Coverage currently validates:

- Protected route redirects for anonymous/unauthorized users
- Allowed-role rendering

File:

- client/src/components/ui/ProtectedRoute.test.tsx

## 11. Documentation and Ops Files

- Root setup/run docs: README.md
- API contracts: docs/API_CONTRACT.md
- Deployment guide: docs/DEPLOYMENT.md
- Vercel config: client/vercel.json
- Render config: server/render.yaml
- Env example: server/.env.example

## 12. Typical Developer Workflows

### 12.1 Start Local Dev

1. Install dependencies at root.
2. Configure server/.env.
3. Run root dev script to start both apps.

### 12.2 Add a New Feature Endpoint

1. Add validator schema.
2. Add controller logic.
3. Add route wiring with auth/role/validate middleware.
4. Add/extend frontend service function.
5. Consume service in page/component.
6. Add tests and update API_CONTRACT.md.

### 12.3 Debug a Production-Like Issue

1. Reproduce request from UI.
2. Capture requestId from response/logs.
3. Trace through middleware and controller logs.
4. Validate DB document state and indexes.

## 13. Known Conventions and Notes

- Hazard naming convention: hazard_name (not name)
- Frontend hazard route: /hazards/manage
- JWT-only auth flow in v1 (no refresh token)
- Polling is used for realtime-like updates in frontend contexts

## 14. Future Enhancement Areas

- Add structured logger sink (file/JSON/observability pipeline)
- Add stricter typed API contracts shared between client and server
- Add richer end-to-end tests for full UI flows
- Add deployment pipeline checks (build/test/lint on PR)

---

If you are onboarding, start with:

1. README.md
2. docs/API_CONTRACT.md
3. client/src/App.tsx and server/src/app.ts
4. The feature workflow section relevant to your assigned module
