# Client App

Frontend for the Industrial Disaster and Shift Coordination Platform.

## Scripts

- Start dev server: npm run dev
- Build for production: npm run build
- Preview production build: npm run preview
- Lint: npm run lint
- Run integration checks: npm run test

## Environment

The client reads:

- VITE_API_URL: backend API base URL. Defaults to http://localhost:3000/api

## Core Screens

- Login and signup
- Role-based dashboards
- Shift create and history
- Emergency create and manage
- Hazard management
- Live location map

## Auth

Client uses JWT from backend login/signup and stores token in localStorage.
