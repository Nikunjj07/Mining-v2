# API Contract

Base URL: /api

All protected routes require header:

Authorization: Bearer <jwt>

## Role Matrix

- admin: full access to dashboards, hazards CRUD, emergency assignment and management
- supervisor: create shifts, view shifts, report emergencies, view dashboards
- worker: report emergencies, create and view shifts where permitted
- rescue: view assigned emergencies and update emergency status

## Auth

### POST /auth/signup
- Access: public
- Body:
  - email: string
  - password: string
  - full_name: string optional
  - role: worker | supervisor | rescue (admin blocked from self-signup)
  - phone_number: string optional
- Response 201:
  - message: string
  - token: string
  - user: object

### POST /auth/login
- Access: public
- Body:
  - email: string
  - password: string
- Response 200:
  - message: string
  - token: string
  - user: object

### GET /auth/me
- Access: authenticated
- Response 200:
  - id
  - email
  - full_name
  - role
  - phone_number
  - created_at

## Shifts

### POST /shifts
- Access: supervisor, worker
- Body:
  - shift: morning | evening | night
  - production_summary: string optional
  - equipment_status: string optional
  - safety_issues: string optional
  - red_flag: boolean optional
  - next_shift_instructions: string optional
- Response 201:
  - message
  - shift_log

### GET /shifts
- Access: authenticated
- Query:
  - page, limit
  - acknowledged: boolean string
- Response 200:
  - shift_logs: array
  - pagination: total, page, limit, pages

### GET /shifts/recent
- Access: authenticated
- Query:
  - limit
- Response 200:
  - shift_logs: array

### POST /shifts/:id/acknowledge
- Access: authenticated
- Response 200:
  - message
  - acknowledgement

## Emergencies

### POST /emergencies
- Access: authenticated
- Body:
  - type: gas_leak | fire | collapse | equipment_failure | worker_trapped | ventilation_failure
  - severity: low | medium | high
  - location: string optional
  - description: string optional
  - latitude: number optional
  - longitude: number optional
- Response 201:
  - message
  - emergency

### GET /emergencies
- Access: authenticated
- Query:
  - page, limit
  - severity
  - status
- Response 200:
  - emergencies: array
  - pagination: total, page, limit, pages

### GET /emergencies/assigned
- Access: rescue
- Response 200:
  - emergencies: array

### PATCH /emergencies/:id/status
- Access: admin or assigned rescue user
- Body:
  - status: active | in_progress | resolved
- Response 200:
  - message
  - emergency

### PATCH /emergencies/:id/assign
- Access: admin
- Body:
  - assigned_to: user id
- Response 200:
  - message
  - emergency

## Hazards

### POST /hazards
- Access: admin
- Body:
  - hazard_name: string
  - description: string optional
  - risk_level: low | medium | high
  - control_measure: string optional
  - responsible_person: string optional
  - review_date: ISO datetime string optional
  - status: string optional
- Response 201:
  - message
  - hazard

### GET /hazards
- Access: authenticated
- Query:
  - page, limit
  - risk_level
  - status
- Response 200:
  - hazards: array
  - pagination: total, page, limit, pages

### GET /hazards/:id
- Access: authenticated
- Response 200:
  - hazard

### PATCH /hazards/:id
- Access: admin
- Body:
  - any hazard fields optional
- Response 200:
  - message
  - hazard

### DELETE /hazards/:id
- Access: admin
- Response 200:
  - message

## Notifications

### GET /notifications
- Access: authenticated
- Query:
  - page, limit
- Response 200:
  - notifications: array
  - pagination

### GET /notifications/unread-count
- Access: authenticated
- Response 200:
  - count

### PATCH /notifications/:id/read
- Access: authenticated
- Response 200:
  - message
  - notification

### PATCH /notifications/mark-all-read
- Access: authenticated
- Response 200:
  - message

## Locations

### POST /locations
- Access: authenticated
- Body:
  - latitude
  - longitude
  - accuracy optional
- Response 200:
  - message
  - location

### GET /locations/active
- Access: authenticated
- Response 200:
  - personnel: array

## Dashboard

### GET /dashboard/admin
- Access: admin
- Response 200:
  - metrics and chart datasets

### GET /dashboard/supervisor
- Access: supervisor
- Response 200:
  - metrics and chart datasets

## Users

### GET /users/rescue
- Access: authenticated
- Response 200:
  - users: array of rescue members
