# Mini Event Management System

Full‑stack assignment implementation: Laravel-style backend + Next.js (App Router) frontend with shadcn‑style UI components.

## Overview

Users can:

1. Create events (name, location, start_time, end_time, optional max_capacity)
2. List upcoming events
3. Register attendees (name, email) with capacity + duplicate safeguards
4. View paginated attendee lists per event

All times are stored in UTC; incoming times assumed in IST (Asia/Kolkata) unless a timezone is supplied. Clients may request localized projections by passing `tz` query parameter.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend (structure) | Laravel-style architecture (Controllers, Services, Models, Requests) |
| Persistence | PostgreSQL or SQLite (migrations included) |
| Time Handling | UTC storage, Carbon for conversion |
| Docs | OpenAPI annotations (swagger) |
| Tests | Feature tests (capacity, duplicates, pagination, timezone) |

> Note: The repository contains the structured backend code under `backend/` but you must initialize a real Laravel project (composer) to run it (see Setup below).

## Directory Structure (Relevant)

```text
backend/
  app/
    Http/Controllers/EventController.php
    Http/Requests/StoreEventRequest.php
    Http/Requests/RegisterAttendeeRequest.php
    Models/{Event,Attendee}.php
    Services/EventService.php
  database/migrations/*.php
  routes/api.php
  tests/Feature/*.php
  OPENAPI_NOTES.md
lib/
  api.ts (frontend API client)
  types.ts
app/(components)/events/* (EventForm, EventsList, etc.)
```

## Backend Setup (Laravel)

```bash
# 1. Create Laravel app inside backend (if not already a full app)
cd backend
composer create-project laravel/laravel .

# 2. Copy provided app/, database/, routes/, tests/ over (if fresh scaffold overwrote)

# 3. Environment (.env)
cp .env.example .env
php artisan key:generate

# For SQLite (quick start):
touch database/database.sqlite
echo "DB_CONNECTION=sqlite" >> .env

# For Postgres (example):
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=events
# DB_USERNAME=postgres
# DB_PASSWORD=secret

# 4. Run migrations
php artisan migrate

# 5. (Optional) Install Swagger tooling
composer require darkaonline/l5-swagger
php artisan vendor:publish --provider "L5Swagger\\L5SwaggerServiceProvider"
php artisan l5-swagger:generate

# 6. Run server
php artisan serve --host=0.0.0.0 --port=8000
```

Swagger UI (after l5-swagger): `http://localhost:8000/api/documentation`

## Frontend Setup

```bash
npm install
NEXT_PUBLIC_API_BASE=http://localhost:8000/api npm run dev
# Open http://localhost:3000
```

If the backend is unreachable the frontend falls back to localStorage for events.

## API Summary

| Method | Endpoint | Description | Notes |
|--------|----------|-------------|-------|
| POST | /api/events | Create event | Body: name, start_time, end_time, (location, max_capacity, timezone) |
| GET | /api/events | List upcoming events | Query: page, per_page, tz |
| POST | /api/events/{id}/register | Register attendee | Enforces capacity + duplicate (case-insensitive) |
| GET | /api/events/{id}/attendees | List attendees | Paginated |

### Sample cURL

```bash
# Create Event (IST assumed)
curl -X POST http://localhost:8000/api/events \\
  -H "Content-Type: application/json" \\
  -d '{
    "name":"Tech Meetup",
    "location":"Online",
    "start_time":"2025-10-01 18:00:00",
    "end_time":"2025-10-01 19:00:00",
    "max_capacity":100,
    "timezone":"Asia/Kolkata"
  }'

# List Events (localized to Europe/Berlin)
curl "http://localhost:8000/api/events?tz=Europe/Berlin"

# Register Attendee
curl -X POST http://localhost:8000/api/events/1/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Alice","email":"alice@example.com"}'

# List Attendees page 2
curl "http://localhost:8000/api/events/1/attendees?page=2&per_page=10"
```

### Response Shape (Event)

```json
{
  "id": 1,
  "name": "Tech Meetup",
  "location": "Online",
  "start_time_utc": "2025-10-01T12:30:00Z",
  "end_time_utc": "2025-10-01T13:30:00Z",
  "max_capacity": 100,
  "remaining_capacity": 99,
  "created_at": "2025-09-29T10:00:00Z",
  "updated_at": "2025-09-29T10:00:00Z",
  "start_time_local": "2025-10-01T18:00:00+05:30",
  "end_time_local": "2025-10-01T19:00:00+05:30"
}
```

### Error Responses

```json
{ "error": "duplicate_attendee" }
{ "error": "capacity_full" }
```

## Sample Responses

See full schema in `backend/public/api-docs/swagger.json`.

Example list events response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Tech Meetup",
      "location": "Online",
      "start_time_utc": "2025-10-01T12:30:00Z",
      "end_time_utc": "2025-10-01T13:30:00Z",
      "max_capacity": 100,
      "remaining_capacity": 42,
      "created_at": "2025-09-29T10:00:00Z",
      "updated_at": "2025-09-29T10:05:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 1, "total_pages": 1 }
}
```

Example attendee pagination response:

```json
{
  "data": [
    { "id": 10, "name": "Alice" },
    { "id": 11, "name": "Bob" }
  ],
  "meta": { "page": 2, "per_page": 2, "total": 6, "total_pages": 3 }
}
```

## Timezone Strategy

1. All storage in UTC (`*_time_utc`).
2. Incoming `start_time` / `end_time` parsed in provided `timezone` field (default IST) then converted to UTC.
3. Optional `tz` query param projects localized copies.
4. Frontend converts or displays as provided.

## Tests

Feature tests (examples):

- Event creation success
- Duplicate attendee rejection
- Capacity full rejection
- Attendee pagination
- IST input stored as UTC

Run (inside backend Laravel app):

```bash
php artisan test
```

## Frontend Notes

The UI currently supports creation and listing of events with graceful fallback to local persistence. Attendee registration UI can be layered by calling `registerAttendee` from `lib/api.ts` and adding a detail view component.

## Possible Enhancements

- Edit / delete events & attendee cancellation
- Email verification or magic links for check-in
- Rate limiting and abuse prevention
- WebSockets / SSE for live capacity updates
- Soft deletes & audit trails
- Background jobs (queue) to send reminders
- iCal export & calendar integration
- Advanced filtering (date range, category, capacity remaining)

## Assumptions

- Provided backend code is illustrative; requires full Laravel bootstrap to run.
- Incoming datetimes are naive local strings interpreted in `timezone` field.
- Category is frontend-only placeholder (not persisted yet).

## License

Educational assignment deliverable – adapt freely.
