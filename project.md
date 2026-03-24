PROJECT.md
Industrial Disaster & Shift Coordination Platform
1. Project Overview

Build a full-stack web application for coal mine productivity and emergency management.

The platform must provide:

Digital Shift Handover System

Emergency Reporting & Coordination

Safety Hazard Management (SMP-style)

Role-Based Access Control

Admin Dashboard

PDF Report Generation

Target Use Case:
Industrial coal mine operations.

Primary Goal:
Replace manual shift logs and improve emergency coordination.

2. Tech Stack

Frontend:

React.js

react-router-dom

TypeScript

Tailwind CSS + tweakcn

Backend:

Node.js

Express.js

TypeScript

MongoDB

Mongoose

JWT (authentication + authorization)

bcrypt (password hashing)

Optional:

Recharts (for dashboard graphs)

jsPDF or PDF-lib (for report export)

Deployment:

Vercel (frontend)

Node.js API server (Render/Railway/VM)

MongoDB Atlas (database)

3. User Roles

There are four roles:

Admin

Supervisor

Worker

Rescue Team

Role Capabilities:

Admin:

View all shift logs

View and manage emergencies

Assign rescue teams

Manage hazards

View analytics dashboard

Supervisor:

Create shift logs

View previous shift logs

Report emergencies

Worker:

Report emergencies only

Rescue Team:

View assigned emergencies

Update emergency status

4. Database Schema

Use MongoDB collections modeled with Mongoose schemas.

Collections:

users

shift_logs

shift_acknowledgements

emergencies

hazards

All relationships must be implemented using ObjectId references.
Add proper indexes for role, status, severity, risk_level, createdAt for query performance.

5. Core Features
5.1 Authentication

Email/password authentication using Express APIs + JWT

Passwords must be hashed with bcrypt before storing

Use access tokens only (no refresh token flow in v1)

Issue access token on login and attach user role in token payload

After login, redirect user based on role

Protect routes based on role

5.2 Shift Log Module

Supervisor Dashboard Page:

Form Fields:

Shift (morning/evening/night)

Production Summary (text)

Equipment Status (text)

Safety Issues (text)

Red Flag (boolean)

Next Shift Instructions (text)

On Submit:

Insert record into shift_logs

Mark acknowledged = false

Shift Viewing Page:

Show recent logs

Highlight red_flag logs

Add “Acknowledge Shift” button

On acknowledge:

Insert into shift_acknowledgements

Update shift_logs.acknowledged = true

5.3 Emergency Module

Emergency Form Page:

Fields:

Type (gas_leak, fire, collapse, equipment_failure, worker_trapped, ventilation_failure)

Severity (low, medium, high)

Location

Description

On Submit:

Insert into emergencies

status = active

Admin Emergency Panel:

View all emergencies

Filter by severity

Change status (active → in_progress → resolved)

Assign rescue team (assigned_to field)

Rescue Dashboard:

Show only emergencies where assigned_to = logged-in rescue user

Allow status update

5.4 Safety Management (Hazard Module)

Admin Page:

CRUD functionality for hazards table.

Fields:

Hazard Name

Description

Risk Level

Control Measure

Responsible Person

Review Date

Display:

Risk-level badges (low/medium/high)

Filter by status

5.5 Admin Dashboard

Show:

Total shift logs today

Pending acknowledgements

Active emergencies

High severity emergencies

Total hazards

High-risk hazards

Include simple charts:

Emergencies by severity

Hazards by risk level

5.6 PDF Report Generation

Add button:

"Generate Shift Report"

Generate PDF with:

Shift details

Supervisor name

Safety issues

Red flag status

Timestamp

Use jsPDF or PDF-lib.

6. UI Structure

Pages:

/login
/signup
/dashboard
/dashboard/admin
/dashboard/supervisor
/dashboard/rescue
/shift/create
/shift/history
/emergency/create
/emergency/manage
/hazards/manage

Use clean minimal UI.
Emergency alerts must use red highlight.
High severity items must visually stand out.

7. Folder Structure

/ (monorepo root)

/client
/client/src
/client/src/app
/client/src/components
/client/src/types
/client/src/utils
/client/src/services

/server
/server/src
/server/src/config
/server/src/controllers
/server/src/middleware
/server/src/models
/server/src/routes
/server/src/services
/server/src/types
/server/src/utils

Use REST APIs between frontend and backend.

Frontend styling approach: Tailwind CSS with tweakcn-style utility class composition.

Create reusable components:

DashboardCard

StatusBadge

DataTable

ProtectedRoute

8. Security

Role-based route protection

JWT verification middleware on protected APIs

Role-based authorization middleware (admin/supervisor/worker/rescue)

bcrypt password hashing with salt rounds

Use helmet, cors, and rate limiting middleware for API hardening

Validate all inputs

Sanitize user input

Do not expose admin routes to non-admin users

Role modeling decision:
Store role as a single enum field on users (admin/supervisor/worker/rescue) for v1 simplicity and performance.
If multi-role users or dynamic permission matrices are needed later, migrate to a separate roles/permissions design.

9. Emergency Detection Logic

Manual Trigger:
User submits emergency form.

Optional Simulation:
Add internal function:
If gas_level > threshold → auto create emergency (for demo).

10. Workflow Summary

Shift Flow:
Supervisor logs shift → saved → next shift acknowledges.

Emergency Flow:
User reports emergency → admin notified → rescue assigned → status updated.

Hazard Flow:
Admin defines hazards → monitors risk → updates review.

11. Priority Order of Development

Authentication

Role-based routing

Shift Log module

Emergency module

Admin dashboard

Hazard management

PDF export

12. Evaluation Goals

The system must demonstrate:

Clear workflow

Functional CRUD operations

Role-based logic

Real-time emergency lifecycle

Clean UI for crisis scenario

13. Deliverable

Working full-stack web app that allows:

Digital shift logging

Emergency coordination

Hazard tracking

Administrative oversight

System must be demo-ready with seeded test data.