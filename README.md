# Food SaaS

A full-stack food ordering and delivery platform built as a two-application monorepo.

The project is designed around four role-specific applications inside one product:

- **Customer** — discover restaurants, browse menus, manage a cart, checkout, pay, and view orders.
- **Restaurant Owner** — onboard restaurants, manage menus, import menus with AI, fulfill orders, and monitor operations.
- **Driver** — register as a driver, manage availability, claim deliveries, update delivery status, and publish location.
- **Admin** — review restaurant onboarding and manage platform-level moderation actions.

The repository combines a modular TypeScript backend, a role-separated Next.js frontend, PostgreSQL persistence, Redis/BullMQ background processing, Stripe payments, Cloudflare R2 object storage, Google Gemini menu extraction, MQTT driver-location messaging, and H3-based geo indexing.

---

## Table of Contents

- [Product Overview](#product-overview)
- [Repository Structure](#repository-structure)
- [Architecture](#architecture)
- [Role-Based Applications](#role-based-applications)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Backend Modules](#backend-modules)
- [Frontend Architecture](#frontend-architecture)
- [Authentication and Authorization](#authentication-and-authorization)
- [Restaurant and Menu Management](#restaurant-and-menu-management)
- [AI Menu Import](#ai-menu-import)
- [Image Processing and Media](#image-processing-and-media)
- [Orders and Fulfillment](#orders-and-fulfillment)
- [Payments with Stripe](#payments-with-stripe)
- [Driver Location and Dispatch](#driver-location-and-dispatch)
- [Background Workers and Queues](#background-workers-and-queues)
- [Outbox and Event Processing](#outbox-and-event-processing)
- [Storage with Cloudflare R2](#storage-with-cloudflare-r2)
- [Database](#database)
- [API Overview](#api-overview)
- [Frontend Routes](#frontend-routes)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Docker and Workers](#docker-and-workers)
- [Testing](#testing)
- [Operational Notes](#operational-notes)
- [Security Notes](#security-notes)
- [Development Conventions](#development-conventions)
- [Roadmap / Next Improvements](#roadmap--next-improvements)
- [License](#license)

---

## Product Overview

The application models a complete food-ordering workflow:

```text
Customer
   │
   ├── discovers restaurant
   ├── browses menu
   ├── adds items to cart
   ├── checks out
   └── pays with Stripe
             │
             ▼
         Order created
             │
             ▼
     Restaurant dashboard
             │
      ┌──────┴──────┐
      │             │
   accept        prepare
      │             │
      └──────┬──────┘
             ▼
          READY
             │
             ▼
      Delivery assignment
             │
             ▼
           Driver
             │
      ┌──────┴───────┐
      │              │
   pick up       live location
      │              │
      └──────┬───────┘
             ▼
         Delivered
             │
             ▼
          Customer
```

Restaurant menu onboarding has a separate asynchronous flow:

```text
Restaurant owner
      │
      ▼
PDF / Image upload
      │
      ▼
Cloudflare R2
      │
      ▼
MenuImport record
      │
      ▼
BullMQ
      │
      ▼
Menu Import Worker
      │
      ├── Gemini document reading
      ├── raw OCR/text extraction
      └── structured menu parsing
                   │
                   ▼
            Zod validation
                   │
                   ▼
          Ready for review
                   │
                   ▼
             Confirmation
                   │
                   ▼
            Published menu
```

---

## Repository Structure

```text
food-saas/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app/
│   │   ├── config/
│   │   ├── generated/
│   │   ├── infrastructure/
│   │   ├── modules/
│   │   │   ├── admin/
│   │   │   ├── customer/
│   │   │   ├── delivery/
│   │   │   ├── identity/
│   │   │   ├── location/
│   │   │   ├── menu/
│   │   │   ├── notifications/
│   │   │   ├── ordering/
│   │   │   ├── payment/
│   │   │   └── restaurant/
│   │   ├── shared/
│   │   └── workers/
│   ├── tests/
│   ├── mosquitto/
│   ├── scripts/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── customer/
│   │   │   ├── driver/
│   │   │   └── restaurant/
│   │   ├── lib/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
└── .gitignore
```

---

# Architecture

## Backend

The backend follows modular clean-architecture boundaries.

```text
HTTP / Route
     │
     ▼
Controller
     │
     ▼
Application Use Case
     │
     ├── Domain Entity / Value Object
     ├── Domain Policy
     └── Repository / Service Interfaces
              │
              ▼
      Infrastructure Adapters
              │
      ┌───────┼────────┬─────────┬─────────┐
      ▼       ▼        ▼         ▼         ▼
   Prisma   Redis      R2      Stripe     Gemini

                    + MQTT / BullMQ
```

The backend uses:

- **Express 5** for HTTP
- **tsyringe** for dependency injection
- **Prisma 7** for PostgreSQL
- **Zod** for request/runtime validation
- **Pino** for structured logging
- Repository interfaces between application/domain layers and infrastructure

---

## Event-Driven / Asynchronous Architecture

Long-running operations are intentionally moved out of the request-response path.

```text
API Request
    │
    ▼
Create/update business state
    │
    ├── DB transaction
    └── Outbox event
             │
             ▼
        Outbox Worker
             │
             ▼
        Event Dispatcher
             │
             ▼
     Idempotent Handlers
```

BullMQ is used for task-oriented asynchronous workloads such as:

- AI menu processing
- image processing
- email delivery

The outbox is used for durable domain events where the business state change and event publication need to remain consistent.

---

# Role-Based Applications

## Customer

Customer routes and features include:

- registration/login
- profile
- preferences
- addresses
- avatar upload/removal
- restaurant discovery
- restaurant detail/menu browsing
- cart
- checkout
- Stripe PaymentElement
- order history
- order detail/status

Frontend namespace:

```text
/customer
```

---

## Restaurant Owner

Restaurant-owner capabilities include:

- restaurant setup
- restaurant lifecycle management
- menu categories
- menu items
- modifier groups
- modifier items
- AI menu import
- order management
- analytics
- polling-based operational dashboard
- new-order visual/audio alerts

Frontend namespaces:

```text
/restaurant/setup
/restaurant/menu-management
/restaurant/dashboard
```

---

## Driver

Driver capabilities include:

- driver registration
- profile
- availability
- location updates
- nearby driver lookup
- delivery assignment discovery
- claiming assignments
- active deliveries
- delivery status updates
- delivery location retrieval

Frontend namespace:

```text
/driver
```

---

## Admin

Admin capabilities include:

- review pending restaurants
- approve restaurants
- suspend restaurants
- suspend users

Frontend namespace:

```text
/admin
```

---

# Core Features

## Identity and Authentication

The identity module provides:

- registration
- login
- current-user lookup
- access/refresh token flow
- logout
- password change
- forgot-password
- reset-password
- email verification
- rate limiting for identity operations

The implementation includes refresh-session persistence and role/status information on users.

---

## Role-Based Authorization

The backend separates:

1. **authentication** — who the caller is
2. **permission checks** — whether the role can perform the operation
3. **resource ownership checks** — whether the specific restaurant/order/delivery belongs to the actor

This matters for endpoints such as:

```text
restaurant/:id
order/:id
delivery/:assignmentId
delivery/order/:orderId/location
```

A permission alone should not be treated as ownership.

---

# Restaurant and Menu Management

The restaurant module handles:

- restaurant creation
- owner association
- restaurant status
- approval
- suspension
- activation/deactivation
- restaurant metadata and address

The menu module supports:

### Categories

- create
- list
- ordering/sorting data
- active/deleted states

### Menu Items

- create
- list
- price
- availability
- dietary preference
- category assignment
- image/media references

### Modifier Groups

- required/optional modifiers
- minimum selections
- maximum selections

### Modifier Items

- names
- price adjustments
- availability
- ordering

The database models the menu-item ↔ modifier-group relationship explicitly with a join table.

---

# AI Menu Import

The menu importer accepts:

- PDF files
- image uploads

The endpoint validates the uploaded file type and enforces a 5 MB upload limit at the route/multipart layer.

### Processing pipeline

```text
POST /api/v1/restaurants/menu-imports
             │
             ▼
       Store source file
             │
             ▼
       Create MenuImport
             │
             ▼
       Add BullMQ Job
             │
             ▼
     Menu Import Worker
             │
             ▼
   GeminiMenuDocumentReader
             │
             ▼
       Raw OCR/text
             │
             ▼
      GeminiMenuParser
             │
             ▼
      Structured JSON
             │
             ▼
       Zod validation
             │
             ▼
     READY_FOR_REVIEW
             │
             ▼
      Owner confirms
             │
             ▼
          IMPORTED
```

### Menu import states

The database currently models:

```text
UPLOADED
PROCESSING
READY_FOR_REVIEW
CONFIRMED
IMPORTED
FAILED
```

The import record also retains:

- source file key
- MIME type
- raw OCR text
- extracted structured data
- warnings/errors
- failure reason
- retry count
- processing/review/confirmation/import timestamps
- optimistic version

### Gemini

Gemini is integrated with the official:

```text
@google/genai
```

SDK.

The parser uses structured JSON output and validates the returned result at runtime before the result is accepted by the application.

---

# Image Processing and Media

The repository now contains a **generic image-processing worker infrastructure**, rather than an avatar-only processing design.

Core components include:

```text
ImageProcessingService
ImageJobProcessor
ImageWorker
Image Queue
ImageProcessingJobData
```

Supported image purposes are modeled as:

```text
USER_AVATAR
RESTAURANT_LOGO
RESTAURANT_COVER
MENU_ITEM
MENU_CATEGORY
```

### Image variants

The image service currently defines variants such as:

| Purpose | Variants |
|---|---|
| User avatar | thumbnail, small |
| Restaurant logo | small, medium |
| Restaurant cover | medium, large |
| Menu item | thumbnail, small, medium, large |
| Menu category | small, medium |

The processing pipeline uses **Sharp** to:

- read image metadata
- auto-orient via EXIF
- resize
- prevent enlargement
- convert variants to WebP
- compress at a configured quality
- persist variant metadata

### Media persistence

The Prisma schema contains:

```text
Media
MediaVariant
```

with entity references for:

```text
Customer.avatarMediaId
Restaurant.logoMediaId
Restaurant.coverMediaId
MenuItem.imageMediaId
MenuCategory.imageMediaId
```

This allows storage metadata and derived image variants to be represented separately from business entities.

### Current integration status

The generic image infrastructure is present and the customer avatar flow queues image-processing jobs.

The worker is also capable of processing restaurant/menu image purposes when those jobs are produced.

The API and domain flows for each image purpose should therefore be treated as separate integration points rather than assuming every purpose is already exposed through a dedicated upload endpoint.

---

# Orders and Fulfillment

Order states currently include:

```text
PENDING
ACCEPTED
PREPARING
READY
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

An order also stores payment status:

```text
PENDING
PAID
FAILED
REFUNDED
```

The order keeps financial snapshots such as:

- subtotal
- delivery fee
- tax
- discount
- total amount

It also snapshots restaurant name and order-item/modifier pricing so historical orders aren't dependent on future menu price changes.

### Order status history

Status changes are recorded in:

```text
OrderStatusHistory
```

with:

- previous status
- new status
- actor
- reason
- timestamp

---

# Payments with Stripe

The payment module uses Stripe PaymentIntents.

Main flow:

```text
Customer checkout
      │
      ▼
POST /api/v1/payments/initialize
      │
      ▼
Create/initialize PaymentIntent
      │
      ▼
Stripe client-side confirmation
      │
      ▼
Stripe webhook
      │
      ▼
Raw-body signature verification
      │
      ▼
Webhook event deduplication
      │
      ▼
Atomic local payment/order state update
```

The backend stores provider-specific payment attempts in:

```text
PaymentAttempt
```

with a unique constraint over:

```text
provider + providerPaymentId
```

Stripe webhooks are expected to be idempotent because webhook delivery can be retried or duplicated.

### Local development

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:4000/api/v1/payments/webhooks/stripe
```

Then use the webhook signing secret generated by the CLI for local testing.

---

# Driver Location and Dispatch

The delivery stack combines:

- MQTT / Mosquitto
- Redis
- H3
- driver availability/status
- delivery assignments

### High-level flow

```text
Driver client
    │
    ▼
MQTT location topic
    │
    ▼
Location Worker
    │
    ▼
DriverLocationService
    │
    ▼
Redis + H3
```

Location configuration includes:

```text
GEO_H3_RESOLUTION
DISPATCH_INITIAL_SEARCH_RADIUS
DISPATCH_MAX_SEARCH_RADIUS
DRIVER_LOCATION_MAX_AGE_SECONDS
```

The delivery layer also supports proximity-based driver discovery.

### Delivery assignment

Typical lifecycle:

```text
Delivery assignment created
        ↓
Driver candidates discovered
        ↓
Assignment offered
        ↓
Eligible driver claims
        ↓
Driver updates delivery status
        ↓
Pickup / delivery completion
```

The assignment model supports optimistic concurrency to prevent multiple drivers from claiming the same active delivery.

---

# Background Workers and Queues

The backend currently defines dedicated worker entry points for:

```text
backend/src/workers/
├── email.worker.main.ts
├── image.worker.main.ts
├── location.worker.main.ts
├── menu-import.worker.main.ts
└── outbox.worker.main.ts
```

### Email Worker

Handles asynchronous email jobs through BullMQ and Nodemailer/SMTP.

### Image Worker

Handles image processing jobs and media variants.

### Menu Import Worker

Runs the asynchronous AI menu extraction pipeline.

### Outbox Worker

Reads durable outbox events, claims them safely, dispatches handlers, retries failures, and handles dead-letter states.

### Location Worker

Consumes driver location messages from MQTT and updates the location subsystem.

Workers are designed to shut down gracefully on:

```text
SIGTERM
SIGINT
```

---

# Outbox and Event Processing

The outbox implementation is designed around:

- PostgreSQL-backed outbox records
- concurrent-safe claiming
- retry state
- exponential backoff
- jitter
- dead-letter handling
- handler execution tracking
- handler leases
- idempotent dispatch
- graceful worker shutdown

Conceptually:

```text
Business Transaction
       │
       ├── update domain state
       └── create OutboxEvent
                │
                ▼
          Outbox Worker
                │
                ▼
       Claim / lease event
                │
                ▼
        Event Dispatcher
                │
         ┌──────┴──────┐
         ▼             ▼
      Handler A      Handler B
         │             │
      lease/        lease/
      heartbeat     heartbeat
         │             │
         └──────┬──────┘
                ▼
         All handlers complete
                │
                ▼
        Mark event processed
```

The backend treats asynchronous delivery as **at-least-once** rather than assuming exactly-once execution.

---

# Storage with Cloudflare R2

The application uses an S3-compatible `FileStorage` abstraction.

The current implementation is based on:

```text
AWS SDK S3 client
+
Cloudflare R2 endpoint
```

Capabilities include:

- normal object uploads
- multipart uploads
- presigned upload-part URLs
- multipart completion
- aborting multipart uploads
- object copy
- object download
- object deletion
- public URL construction

R2 configuration is isolated under infrastructure code.

### Recommended production architecture

For public images:

```text
Application
    ↓
Cloudflare R2
    ↓
Cloudflare custom domain / CDN
    ↓
Browser
```

Keep R2 credentials server-side.

Do not expose:

```text
R2_SECRET_ACCESS_KEY
R2_ACCESS_KEY_ID
```

to the frontend.

---

# Database

The database uses PostgreSQL with Prisma.

Major entity groups include:

### Identity

```text
User
RefreshSession
EmailVerification
PasswordReset
```

### Customer

```text
Customer
CustomerAddress
```

### Restaurant

```text
Restaurant
```

### Menu

```text
MenuCategory
MenuItem
MenuModifierGroup
MenuModifierItem
MenuItemToModifierGroup
MenuImport
```

### Ordering

```text
Order
OrderItem
OrderItemModifier
OrderStatusHistory
```

### Payments

```text
PaymentAttempt
ProcessedWebhook
```

### Delivery

```text
Driver
DeliveryAssignment
DriverAvailability
```

### Media

```text
Media
MediaVariant
```

### Eventing

```text
OutboxEvent
EventHandlerExecution
```

Prisma migrations are stored in:

```text
backend/prisma/migrations/
```

---

# API Overview

Base API prefix:

```text
/api/v1
```

### Health

```http
GET /live
GET /health
```

### Identity

```http
POST /api/v1/identity/register
POST /api/v1/identity/login
POST /api/v1/identity/refresh
GET  /api/v1/identity/me
POST /api/v1/identity/logout
PATCH /api/v1/identity/change-password
GET  /api/v1/identity/verify-email/:token
POST /api/v1/identity/forgot-password
PUT  /api/v1/identity/reset-password/:token
```

### Customer

The customer module includes profile, preference, address, and avatar endpoints under:

```text
/api/v1/customers
```

including:

```text
GET  /me
PATCH /update-profile
PATCH /me/update-preferences
POST /me/avatar
POST /me/avatar/no-stream
DELETE /me/avatar
POST /me/addresses
GET  /me/addresses
PATCH /me/addresses/:addressId
DELETE /me/addresses/:addressId
POST /me/addresses/:addressId/default
```

### Restaurant

Restaurant management is mounted under:

```text
/api/v1/restaurants
```

and includes restaurant creation, reading/updating, activation/deactivation, deletion, and admin approval/suspension operations.

### Menu

Menu APIs are also mounted beneath:

```text
/api/v1/restaurants
```

Examples:

```text
POST /api/v1/restaurants/:restaurantId/categories
GET  /api/v1/restaurants/:restaurantId/categories

POST /api/v1/restaurants/:restaurantId/items
GET  /api/v1/restaurants/:restaurantId/items

POST /api/v1/restaurants/:restaurantId/modifier-groups
GET  /api/v1/restaurants/:restaurantId/modifier-groups

POST /api/v1/restaurants/:restaurantId/modifier-groups/:modifierGroupId/items
GET  /api/v1/restaurants/:restaurantId/modifier-groups/:modifierGroupId/items

POST /api/v1/restaurants/:restaurantId/menu-imports
GET  /api/v1/restaurants/:restaurantId/menu-imports/:importId
POST /api/v1/restaurants/:restaurantId/menu-imports/:importId/confirm
POST /api/v1/restaurants/:restaurantId/menu-imports/:importId/retry
```

### Orders

```text
POST /api/v1/orders
GET  /api/v1/orders
GET  /api/v1/orders/:id

GET   /api/v1/orders/restaurants/:restaurantId
GET   /api/v1/orders/restaurants/:restaurantId/analytics
PATCH /api/v1/orders/restaurants/:restaurantId/:orderId/status
```

### Payments

```text
POST /api/v1/payments/initialize
POST /api/v1/payments/webhooks/stripe
```

### Delivery

Driver and delivery endpoints are mounted under `/api/v1`, including:

```text
POST  /api/v1/drivers/register
GET   /api/v1/drivers/me
PATCH /api/v1/drivers/me/availability
PATCH /api/v1/drivers/me/location
GET   /api/v1/drivers/nearby

GET   /api/v1/deliveries/available
GET   /api/v1/deliveries/my-active
POST  /api/v1/deliveries/:assignmentId/claim
PATCH /api/v1/deliveries/:assignmentId/status

GET /api/v1/deliveries/:assignmentId/location
GET /api/v1/deliveries/order/:orderId/location
```

### Admin

```text
GET   /api/v1/admin/restaurants/pending
PATCH /api/v1/admin/restaurants/:id/approve
PATCH /api/v1/admin/restaurants/:id/suspend
PATCH /api/v1/admin/users/:id/suspend
```

The exact request/response payloads should be treated as the source of truth in the controllers, validators, DTOs, and frontend API clients.

---

# Frontend Architecture

The frontend is a Next.js App Router application with explicit role namespaces.

## Routing

```text
/customer
/restaurant
/driver
/admin
```

The previous ambiguous role-routing approach has been replaced with explicit role boundaries.

### Feature organization

```text
features/
├── admin/
├── auth/
├── customer/
│   ├── cart/
│   ├── orders/
│   └── restaurants/
├── driver/
│   └── deliveries/
└── restaurant/
    ├── menu/
    └── orders/
```

Shared UI and application utilities stay outside role-specific feature folders.

---

# Customer Frontend

Important pages include:

```text
/customer
/customer/restaurants/[id]
/customer/checkout
/customer/orders
/customer/orders/[id]
/customer/account/profile
/customer/account/addresses
/customer/account/preferences
```

Customer state uses:

- TanStack React Query for server state
- Zustand for cart state
- React Hook Form + Zod for forms
- Stripe Elements for payment collection
- Google Maps for map views where applicable

---

# Restaurant Frontend

Important pages:

```text
/restaurant/setup
/restaurant/menu-management
/restaurant/dashboard
```

The restaurant dashboard includes:

- daily revenue KPI
- active orders count
- completed orders count
- order list
- polling-based refresh
- new pending-order detection
- toast notifications via Sonner
- optional audio alert

---

# Driver Frontend

Driver routes include:

```text
/driver/register
/driver/dashboard
```

The driver UI integrates with delivery APIs, availability, and location-related functionality.

---

# Admin Frontend

Admin routes include:

```text
/admin/dashboard
```

The current admin feature set focuses on restaurant onboarding/moderation workflows.

---

# Environment Configuration

The backend's authoritative environment schema is:

```text
backend/src/config/env.schema.ts
```

## Backend variables

### Application

```env
NODE_ENV=development
PORT=4000
APP_NAME=food-saas
FRONTEND_URL=http://localhost:3000
```

### PostgreSQL / Redis

```env
DATABASE_URL=postgresql://...
TEST_DATABASE_URL=postgresql://...

REDIS_HOST=localhost
REDIS_PORT=6379

CACHE_PREFIX=food-saas
CACHE_VERSION=v1
```

### HTTP / proxy / rate limiting

```env
TRUST_PROXY=false
REQUEST_TIMEOUT=...
GLOBAL_RATE_LIMIT_WINDOW=...
GLOBAL_RATE_LIMIT_MAX=...

LOGIN_USER_RATE_LIMIT_WINDOW=...
LOGIN_USER_RATE_LIMIT_MAX=...

REGISTER_USER_RATE_LIMIT_WINDOW=...
REGISTER_USER_RATE_LIMIT_MAX=...

FORGOT_PASSWORD_RATE_LIMIT_WINDOW=...
FORGOT_PASSWORD_RATE_LIMIT_MAX=...

RESET_PASSWORD_RATE_LIMIT_WINDOW=...
RESET_PASSWORD_RATE_LIMIT_MAX=...

REFRESH_TOKEN_RATE_LIMIT_WINDOW=...
REFRESH_TOKEN_RATE_LIMIT_MAX=...

VERIFY_EMAIL_RATE_LIMIT_WINDOW=...
VERIFY_EMAIL_RATE_LIMIT_MAX=...
```

### Authentication

```env
SALT_ROUNDS=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=...
JWT_REFRESH_EXPIRES_IN=...
JWT_ISSUER=...
JWT_AUDIENCE=...
```

### Email

```env
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM=...
EMAIL_VERIFICATION_URL=http://localhost:3000/verify-email
RESET_PASSWORD_TOKEN_EXPIRY=...
```

### R2

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
S3_API=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...
```

### MQTT

```env
MQTT_URL=...
MQTT_USERNAME=...
MQTT_PASSWORD=...
MQTT_TLS_REJECT_UNAUTHORIZED=true
```

### Stripe

```env
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

### Gemini

```env
GEMINI_API_KEY=...
```

### Geo / dispatch

```env
GEO_H3_RESOLUTION=8
DISPATCH_INITIAL_SEARCH_RADIUS=1
DISPATCH_MAX_SEARCH_RADIUS=5
DRIVER_LOCATION_MAX_AGE_SECONDS=60
```

The exact values should be chosen for the deployment rather than copied blindly from development.

---

# Local Development

## Prerequisites

Recommended:

- Node.js current LTS
- npm
- PostgreSQL
- Redis
- Docker / Docker Compose
- Cloudflare R2 account
- Stripe test account
- Gemini API key
- SMTP provider/credentials
- Google Maps API key

---

## Backend setup

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

from your local environment configuration.

Generate Prisma Client:

```bash
npm run db:generate
```

Run development migrations:

```bash
npx prisma migrate dev
```

Run the API:

```bash
npm run dev
```

---

## Frontend setup

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Start Next.js:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:4000
```

API:

```text
http://localhost:4000/api/v1
```

---

# Docker and Workers

The current `backend/docker-compose.yml` defines:

```text
backend
email-worker
image-worker
outbox-worker
location-worker
menu-import-worker
mosquitto
redis
```

All backend/worker containers use the same built backend image but run different entry points.

Run:

```bash
cd backend
docker compose up --build
```

### Important: PostgreSQL

The current Compose file does **not** define a PostgreSQL service.

PostgreSQL therefore needs to be supplied separately and reachable through:

```env
DATABASE_URL=...
```

---

# Testing

The backend uses Vitest.

### Unit/general test suite

```bash
cd backend
npm test
```

### Watch mode

```bash
npm run test:watch
```

### Integration tests

```bash
npm run test:integration
```

### HTTP tests

```bash
npm run test:http
```

### End-to-end tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:coverage
```

### Test database migration

```bash
npm run test:db:migrate
```

### Test database reset

```bash
npm run test:db:reset
```

Test database configuration is loaded through `.env.test`.

---

# Operational Notes

## File uploads

Customer avatars use validated multipart uploads. The project also has a generic image-processing queue capable of generating derived WebP variants.

For new image types, use the existing:

```text
Media
MediaVariant
ImageProcessingJob
ImageProcessingService
ImageWorker
```

instead of creating a new image-processing subsystem.

---

## Image URLs

The database keeps media/object-key information alongside compatibility URL fields where currently used by existing domain models.

For a production architecture, public image delivery should use a stable custom CDN domain backed by R2.

Avoid leaking R2 access credentials into frontend code.

---

## Menu import retries

Two retry concepts exist:

```text
BullMQ attempts
    = automatic infrastructure retry

MenuImport.retryCount
    = domain/manual retry flow
```

These should not be conflated.

---

## Dashboard freshness

The restaurant dashboard currently uses periodic React Query polling rather than a dedicated WebSocket/SSE channel.

This is intentionally simpler for the current product stage.

A later event-driven upgrade can coexist with periodic reconciliation/refetch.

---

# Security Notes

The project already includes security-oriented infrastructure such as:

- Helmet
- CORS
- rate limiting
- JWT-based authentication
- refresh-session persistence
- role/permission checks
- resource ownership checks
- Zod validation
- raw Stripe webhook signature verification
- upload validation
- structured logging
- server-side secret handling

### Never commit

```text
.env
JWT secrets
Stripe secret keys
Gemini API keys
R2 secret keys
SMTP passwords
MQTT passwords
private TLS keys
```

Mosquitto certificate/private-key material should be generated for the environment and not committed.

### Stripe

Webhook signatures must always be verified from the raw request body.

### R2

Keep R2 credentials server-side.

### MQTT

Production deployments should keep TLS verification enabled.

### AI output

Gemini output is external/untrusted data and must continue to pass runtime schema validation before being persisted.

---

# Development Conventions

## Add a feature

Prefer:

```text
module/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

with infrastructure-specific implementations behind interfaces/tokens.

## Add asynchronous work

Use the existing:

```text
BullMQ
```

infrastructure.

Do not create an entirely separate queue system unless there is a concrete operational reason.

## Add durable domain events

Use the existing outbox pattern so the event is written in the same transaction as the business state change.

## Add image processing

Use:

```text
Media
MediaVariant
ImageProcessingService
Image queue
Image worker
```

rather than adding one worker per image type.

## Add authorization

Check both:

```text
role/permission
+
resource ownership
```

for user-owned resources.

---

# Production Readiness Checklist

Before deploying to production:

- [ ] PostgreSQL production instance is configured.
- [ ] Prisma migrations are applied.
- [ ] Redis is secured.
- [ ] All worker processes are deployed.
- [ ] Outbox worker monitoring is enabled.
- [ ] BullMQ retries/dead-letter policies are reviewed.
- [ ] Stripe webhook endpoint is configured with the correct secret.
- [ ] Stripe test/live keys are not mixed.
- [ ] Gemini API key is stored in secret management.
- [ ] R2 credentials are server-only.
- [ ] Public asset domain/CDN is configured.
- [ ] Private documents remain private.
- [ ] MQTT uses TLS and production credentials.
- [ ] Location worker is monitored.
- [ ] CORS is restricted to expected origins.
- [ ] Proxy trust settings match the deployment topology.
- [ ] Rate limits are tuned for production traffic.
- [ ] Error responses do not expose internal stack traces.
- [ ] Logging does not contain secrets.
- [ ] Worker graceful shutdown is tested.
- [ ] Backup/recovery strategy exists for PostgreSQL.
- [ ] Stripe webhook retry/idempotency behavior is tested.
- [ ] Concurrent delivery claiming is tested.
- [ ] Menu import retry/failure behavior is tested.
- [ ] Image processing retry/idempotency behavior is tested.

---

# Common Local Commands

## Backend

```bash
cd backend

npm install
npm run dev
npm run build
npm start

npm run db:generate
npx prisma migrate dev

npm test
npm run test:watch
npm run test:integration
npm run test:http
npm run test:e2e
npm run test:coverage
```

## Frontend

```bash
cd frontend

npm install
npm run dev
npm run build
npm start
npm run lint
```

## Docker

```bash
cd backend
docker compose up --build
```

---

# Project Status

The current codebase contains the main building blocks of a production-style food ordering platform:

### Platform

- [x] Role-separated frontend applications
- [x] Modular Express backend
- [x] PostgreSQL + Prisma
- [x] Dependency injection
- [x] Central request validation
- [x] Authentication and authorization

### Customer

- [x] Profiles
- [x] Preferences
- [x] Addresses
- [x] Cart
- [x] Restaurant/menu browsing
- [x] Checkout
- [x] Stripe payment UI
- [x] Order history
- [x] Avatar/media foundations

### Restaurant

- [x] Restaurant onboarding/setup
- [x] Categories
- [x] Menu items
- [x] Modifier groups/items
- [x] AI menu import
- [x] Order fulfillment
- [x] Analytics
- [x] Dashboard notifications

### Driver

- [x] Driver registration
- [x] Availability
- [x] Location publishing
- [x] Delivery assignment claiming
- [x] Delivery status management
- [x] Location lookup
- [x] H3/Redis location infrastructure

### Platform infrastructure

- [x] BullMQ
- [x] Email worker
- [x] Image worker
- [x] Menu import worker
- [x] Location worker
- [x] Outbox worker
- [x] Event handler leases/idempotency infrastructure
- [x] Cloudflare R2 integration
- [x] Stripe
- [x] MQTT
- [x] Redis
- [x] Sharp image processing

---

# Roadmap / Next Improvements

Natural future improvements for the architecture include:

1. **Complete media integration across all entity upload flows**
   - restaurant logos
   - restaurant covers
   - menu item images
   - category images
   - public/private media policies

2. **Restaurant-local analytics timezone**
   - calculate business-day boundaries in the restaurant's configured timezone
   - convert those boundaries to UTC for PostgreSQL queries

3. **More event-driven dashboard updates**
   - SSE/WebSockets for immediate order notifications
   - keep periodic refetch as reconciliation/fallback

4. **Expanded notification infrastructure**
   - push notifications
   - SMS
   - email templates
   - notification preferences

5. **Advanced dispatch**
   - smarter driver ranking
   - ETA estimation
   - routing
   - delivery optimization

6. **Operational observability**
   - metrics
   - queue depth monitoring
   - dead-letter monitoring
   - worker health dashboards
   - tracing

---

# License

The backend package currently declares:

```text
ISC
```

in `backend/package.json`.

If this repository is published publicly, confirm the intended license for the entire monorepo and add a root-level `LICENSE` file.

---

## Summary

Food SaaS is structured as a modular, role-aware, asynchronous food-ordering platform with:

```text
Next.js + React
        +
Express + TypeScript
        +
PostgreSQL + Prisma
        +
Redis + BullMQ
        +
Cloudflare R2
        +
Stripe
        +
Gemini
        +
MQTT + H3
```

The architecture is intentionally designed so that expensive or failure-prone work—AI menu extraction, email, image processing, location ingestion, and durable event handling—can run outside the main HTTP request lifecycle.
