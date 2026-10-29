# TabibiGo Client API — Backend Architecture

**Status:** Proposed final architecture baseline — pending review of existing code and unresolved domain decisions
**Target location:** `TabibiGo/client-api/ARCHITECTURE.md`
**Scope:** Client API backend only. This document does not define the Client frontend or Admin frontend/backend in detail, and does not implement code.

## 1. Architectural decision

Use a **Feature-Based Modular Monolith** for the Client API:

- One Express application and one Client database connection.
- Separate feature modules for domain responsibilities.
- Each domain model has one owner module.
- Modules cooperate through explicit service interfaces or workflows, not arbitrary imports of each other's controllers/internal files.
- Do not create a separate backend or database per feature.
- The Admin project remains separate, with its own frontend, API, database, credentials, and JWT configuration.
- The Admin API accesses Client-owned data only through authenticated HTTP endpoints under `/internal`; it does not connect directly to the Client database or import Client Mongoose models.

The current documentation lists 60 Client API endpoints in 12 groups and 19 internal endpoints. These are planned API contracts, not proof that all endpoints have been implemented.

## 2. System boundary

```text
Client Frontend (Patient + Provider)
              | HTTP /api/*
              v
        TabibiGo Client API
              |
              v
        Client MongoDB

Separate Admin project:
Admin Frontend -> Admin API
                      | authenticated HTTP /internal/*
                      v
                Client API -> Client MongoDB
```

The Client API owns Client data: USER, patient/provider profiles, provider applications/documents, assessments, service access, services, requests, offers, bookings, ratings, notifications, and provider balance records.

`ADMIN`, `ADMIN_REFRESH_TOKEN`, and `AUDIT_LOG` belong to the Admin system/database. An admin ID written to a Client-owned record is a **logical cross-system reference**, not a physical foreign key to the Admin database. A forwarded `X-Admin-Id` is not trusted by itself; only accept such metadata under a verified service-to-service contract.

## 3. Target directory tree

This is a target map, not a claim that every listed folder already exists. Preserve the existing backend foundation (`app.js`, `server.js`, `config/env.js`, `config/database.js`, health endpoint, package setup) and evolve it incrementally.

```text
TabibiGo/client-api/
├── package.json
├── package-lock.json
├── .env                         # local only; never commit
├── .env.example                 # safe placeholders only
├── .gitignore
├── README.md
├── ARCHITECTURE.md
├── nodemon.json                 # only if currently used
│
├── src/
│   ├── app.js                   # configure Express; no business logic
│   ├── server.js                # validate config, connect DB, start server
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── database.js
│   │   ├── cors.js
│   │   └── security.js
│   │
│   ├── routes/
│   │   ├── api.routes.js        # aggregate client-facing /api routes
│   │   ├── internal.routes.js   # aggregate protected /internal routes
│   │   └── health.routes.js
│   │
│   ├── middlewares/
│   │   ├── authenticate-client.js
│   │   ├── authorize-role.js
│   │   ├── require-service-auth.js
│   │   ├── validate-request.js
│   │   ├── rate-limit.js
│   │   ├── not-found.js
│   │   └── error-handler.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── uploads/
│   │   ├── patient-profile/
│   │   ├── patient-verification/
│   │   ├── catalog/
│   │   ├── provider-profile/
│   │   ├── provider-application/
│   │   ├── provider-documents/
│   │   ├── assessments/
│   │   ├── provider-services/
│   │   ├── public-browse/
│   │   ├── bookings/
│   │   ├── service-requests/
│   │   ├── offers/
│   │   ├── ratings/
│   │   ├── notifications/
│   │   └── balance/
│   │
│   ├── workflows/
│   │   ├── register-client-account.workflow.js
│   │   ├── accept-offer.workflow.js
│   │   └── complete-booking.workflow.js
│   │
│   ├── integrations/
│   │   ├── sms/
│   │   ├── google/
│   │   └── storage/
│   │
│   ├── database/
│   │   └── transaction.js
│   │
│   ├── shared/
│   │   ├── errors/              # AppError, error codes, global mapper
│   │   ├── responses/           # success/DTO response helpers
│   │   ├── logging/
│   │   ├── constants/
│   │   └── utils/
│   │
│   ├── jobs/
│   │   ├── expire-service-requests.job.js
│   │   ├── expire-time-proposals.job.js
│   │   ├── booking-reminders.job.js
│   │   ├── update-upcoming-bookings.job.js
│   │   └── cleanup-notifications.job.js
│   │
│   └── scripts/
│       ├── seed-professions.js
│       └── seed-service-catalog.js
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Folder rule:** Do not create every future folder or empty file immediately. This is the approved target structure to review; create each module's actual files when its architecture is approved and work on that feature begins.

## 4. Application infrastructure

### `src/app.js`
Creates/configures Express, installs common middleware, security headers, Client-origin CORS, JSON parsing, then registers `/health`, `/api`, and `/internal` route aggregators. Registers not-found and global error handlers last. No feature business logic here.

### `src/server.js`
Validates environment variables, connects to Client MongoDB, starts the listener only after startup checks pass, and handles graceful shutdown. Never logs credentials or secrets.

### `src/config/`
- `env.js`: validate required environment variables at startup.
- `database.js`: owns the Client DB connection configuration, not model definitions.
- `cors.js`: strict allowlist for the Client web origin; no wildcard with credentials.
- `security.js`: global security-header defaults (e.g. Helmet).

### `src/routes/`
- `api.routes.js`: aggregates public/client-facing feature routers under `/api`.
- `internal.routes.js`: aggregates module-owned internal routers under `/internal`, with service authentication applied before internal handlers.
- `health.routes.js`: minimal health/readiness routes that do not expose secrets or detailed infrastructure diagnostics.

### `src/middlewares/`
- `authenticate-client.js`: validates Client JWT signature, expiry and the finalized expected realm/issuer/audience, and attaches user identity/role.
- `authorize-role.js`: role allowlist checks (`patient`, `provider`). Resource ownership still must be checked by the owning domain service.
- `require-service-auth.js`: validates service-to-service credentials for Admin API calls to `/internal`; distinct from both user JWTs.
- `validate-request.js`: validates body, query, and path input against the route schema.
- `rate-limit.js`: shared rate-limiting setup with stricter policies for OTP/auth and suitable limits for public endpoints.
- `not-found.js`: standard 404 for unknown paths.
- `error-handler.js`: maps expected application errors and unexpected errors to a safe, consistent response envelope.

**Security invariant:** Client JWTs are not Admin JWTs; Admin JWTs are not Client JWTs; user JWTs do not authorize `/internal` calls.

## 5. Default structure inside a feature module

Use this as a convention, not a requirement to create needless files:

```text
feature-name/
├── feature-name.routes.js
├── feature-name.controller.js
├── feature-name.service.js
├── feature-name.validation.js
├── feature-name.constants.js        # only if useful
├── models/
│   └── domain-model.model.js        # only models owned by this module
├── internal/                        # only if Admin API needs internal routes
│   ├── feature-name.internal.routes.js
│   └── feature-name.internal.controller.js
└── tests/
    ├── feature-name.service.test.js
    └── feature-name.routes.test.js
```

- **Routes:** HTTP paths/methods and middleware chain.
- **Controller:** translate HTTP request/response and call service functions.
- **Service:** domain rules, ownership checks, state transitions, and domain operations.
- **Validation:** request schemas and field constraints.
- **Models:** persistence schema, indexes, constraints for entities owned by this module.
- **Internal handlers:** restricted Admin-to-Client contract where required.
- **Tests:** module rules and route contracts.

Never define the same collection/model in multiple modules. Prefer an exported service/interface or a workflow over importing another module's private controller or internal implementation.

## 6. Feature modules: responsibilities and files

### 6.1 `modules/auth/`
**Owns:** `USER`, `OTP_CODE`, `REFRESH_TOKEN`.

```text
auth/
├── auth.routes.js
├── auth.controller.js
├── auth.service.js
├── auth.validation.js
├── auth.constants.js
├── services/
│   ├── otp.service.js
│   ├── google-auth.service.js
│   └── token.service.js
└── models/
    ├── user.model.js
    ├── otp-code.model.js
    └── refresh-token.model.js
```

Endpoints: `POST /api/auth/otp/request`, `POST /api/auth/otp/verify`, `POST /api/auth/google`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`.

Owns Client registration/sign-in, OTP checks, Google identity verification flow, Client tokens, refresh rotation/revocation, logout, `/me`. It does not own profile editing, patient identity review, provider onboarding decisions, document review, or booking logic.

**Cross-module registration decision:** the blueprint currently says registration also creates a Patient Profile, or a Provider Profile plus draft Provider Application. If this atomic behavior remains required, `workflows/register-client-account.workflow.js` orchestrates the write through the owning modules inside one transaction. `auth` still owns only `USER`/OTP/tokens; profile/application models keep their module ownership. This transaction and failure contract must be finalized before implementation.

### 6.2 `modules/uploads/`
Suggested files: `uploads.routes.js`, `uploads.controller.js`, `uploads.service.js`, `uploads.validation.js`.

Endpoint: `POST /api/uploads`.

Owns file acceptance rules, type/size validation, storage integration, and return of safe file references. Binary content is not stored in MongoDB. Final storage provider and signed-URL policy remain decisions until selected.

### 6.3 `modules/patient-profile/`
**Owns:** `PATIENT_PROFILE`.

Suggested files: `patient-profile.routes.js`, `patient-profile.controller.js`, `patient-profile.service.js`, `patient-profile.validation.js`, `models/patient-profile.model.js`.

Endpoints: `GET /api/patient/profile`, `PATCH /api/patient/profile`.

Owns profile reads/partial updates, profile completeness/missing fields, age/profile-lock rules, and the `bookingEligible` result derived from profile completeness and identity state. Health information is optional and sensitive.

### 6.4 `modules/patient-verification/`
**Owns:** `PATIENT_VERIFICATION`; coordinates with the Patient Profile service when updating cached identity status.

Suggested files: `patient-verification.routes.js`, controller, service, validation, model, and `internal/` routes/controller.

Client endpoints: `GET /api/patient/verification`, `POST /api/patient/verification`.

Internal endpoints: `GET /internal/patient-verifications`, `GET /internal/patient-verifications/:id`, `PATCH /internal/patient-verifications/:id`.

Owns submission, own history, pending-submission rules, review result/rejection reason, review metadata, and atomic identity-status update. Private photos stay in external storage.

### 6.5 `modules/catalog/`
**Owns:** `PROFESSION`, `SERVICE_CATALOG`.

Suggested files: `catalog.routes.js`, controller, service, validation, `models/profession.model.js`, `models/service-catalog.model.js`.

Endpoints: `GET /api/catalog/service-types`, `GET /api/catalog/professions`.

Owns read-only professions/catalog, active-item filtering, and pagination. Seed scripts populate reference data.

### 6.6 `modules/provider-profile/`
**Owns:** `PROVIDER_PROFILE`.

Suggested files: provider-profile routes/controller/service/validation/model and internal routes/controller if needed.

Client endpoints: `GET /api/provider/profile`, `PATCH /api/provider/profile`.

Internal endpoint: `GET /internal/providers`.

Owns provider profile reads/updates, profession selection/lock rules, service-area and availability data, and the provider data exposed to authorized internal review. Public projections are handled by `public-browse`.

### 6.7 `modules/provider-application/`
**Owns:** `PROVIDER_APPLICATION`.

Suggested files: provider-application routes/controller/service/validation/model and internal handlers.

Client endpoints: `GET /api/provider/application`, `PUT /api/provider/application`, `POST /api/provider/application/submit`.

Internal endpoints: `GET /internal/provider-applications`, `GET /internal/provider-applications/:id`, `PATCH /internal/provider-applications/:id`.

Owns draft editing, missing-item calculation, submission requirements, application state transitions, reasons, and final decision fields. It does not own authentication or document file storage.

### 6.8 `modules/provider-documents/`
**Owns:** `PROVIDER_DOCUMENT`.

Suggested files: provider-documents routes/controller/service/validation/model and internal handlers.

Client endpoints: `GET /api/provider/documents`, `POST /api/provider/documents`, `DELETE /api/provider/documents/:id`.

Internal endpoint: `PATCH /internal/provider-documents/:id`.

Owns metadata association, application-state checks for add/delete, file reference validation, review state/rejection reason, and secure access references. Store references/metadata, not binary files, in MongoDB.

### 6.9 `modules/assessments/`
**Candidate owner:** `ASSESSMENT` using `type = interview | practical_exam`.

Suggested files: assessments routes/controller/service/validation/model and internal handlers.

Client endpoint: `GET /api/provider/assessments`.

Internal endpoints: `POST /internal/provider-applications/:id/assessments`, `PATCH /internal/assessments/:id`.

Owns assessment schedule/details, status/history, interview result, practical checklist/result, and provider-visible assessment summaries.

**Data-model conflict to resolve:** an earlier ERD uses separate `INTERVIEW` and `PRACTICAL_EXAM` entities, while the expanded current specification uses `ASSESSMENT` with a type. Do not implement both until the canonical model is explicitly selected.

### 6.10 `modules/provider-services/`
**Owns:** `PROVIDER_SERVICE_ACCESS`, `SERVICE`.

Suggested files: provider-services routes/controller/service/validation, models, and internal handlers.

Client endpoints:
- `GET /api/provider/services/available`
- `POST /api/provider/service-requests`
- `GET /api/provider/services`
- `PATCH /api/provider/services/:id`
- `POST /api/provider/services/:id/publish`
- `POST /api/provider/services/:id/unpublish`

Internal endpoints:
- `GET /internal/provider-service-access`
- `GET /internal/providers/:id/service-access`
- `POST /internal/provider-service-access/:id/assessments`
- `PATCH /internal/provider-service-access/:id/decision`
- `PATCH /internal/provider-service-access/:id/revoke`

Owns per-provider/per-service access, profession/catalog eligibility, service card creation/edit/publish/unpublish, internal review actions, and revocation. Public visibility requires approved access plus a valid published card.

### 6.11 `modules/public-browse/`
Read-only query module; no new domain model ownership.

Suggested files: `public-browse.routes.js`, controller, service, validation.

Endpoints: `GET /api/services`, `GET /api/services/:id`, `GET /api/providers/:id`.

Owns public filtering/sorting/pagination and safe projections of published services and approved provider profiles. Never return documents, private contact details, internal assessment notes, health information, or patient data.

### 6.12 `modules/bookings/`
**Owns:** `BOOKING`.

Suggested files:
```text
bookings/
├── patient-booking.routes.js
├── provider-booking.routes.js
├── patient-booking.controller.js
├── provider-booking.controller.js
├── booking.service.js
├── booking.validation.js
├── booking.constants.js
└── models/booking.model.js
```

Patient endpoints: `POST /api/bookings`, `GET /api/bookings`, `GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel`, `PATCH /api/bookings/:id/time-proposal`.

Provider endpoints: `GET /api/provider/bookings`, `PATCH /api/provider/bookings/:id/accept`, `PATCH /api/provider/bookings/:id/reject`, `PATCH /api/provider/bookings/:id/start`, `PATCH /api/provider/bookings/:id/complete`, `PATCH /api/provider/bookings/:id/cancel`, `POST /api/provider/bookings/:id/propose-time`.

Owns creation/read/cancel, ownership, booking state machine, provider availability/overlap checks, time proposals, price snapshots, and eligibility gates. Enforce identity/profile eligibility on the server.

### 6.13 `modules/service-requests/`
**Owns:** `SERVICE_REQUEST`.

Suggested files: service-requests routes/controller/service/validation/model.

Endpoints: `POST /api/requests`, `GET /api/requests`, `GET /api/requests/:id`, `PATCH /api/requests/:id/cancel`.

Owns patient-created requests, eligibility, preferred-time/budget/address rules, expiry calculation, owner-only access, and request state transitions.

### 6.14 `modules/offers/`
**Owns:** `OFFER`.

Suggested files: offers routes/controller/service/validation/model.

Endpoints: `POST /api/requests/:id/offers/:offerId/accept`, `GET /api/provider/requests`, `GET /api/provider/requests/:id`, `POST /api/provider/requests/:id/offers`, `GET /api/provider/offers`, `PATCH /api/provider/offers/:id/withdraw`.

Owns the provider request queue filters, sending an offer, price/time/duration validation, withdrawal, offer list and state transitions. Accepting an offer also changes a request and creates a booking, so coordinate it in `accept-offer.workflow.js` rather than duplicate Booking logic.

### 6.15 `modules/ratings/`
**Owns:** `RATING`.

Suggested files: ratings routes/controller/service/validation/model.

Endpoint: `POST /api/bookings/:id/rating`.

Owns booking owner/completed checks, one rating per booking, star/comment validation, persistence, and rating aggregation if the design chooses to maintain a cached aggregate.

### 6.16 `modules/notifications/`
**Owns:** `NOTIFICATION`.

Suggested files: notifications routes/controller/service/validation, `notification-events.js`, model.

Endpoints: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`.

Owns event-to-recipient mapping, idempotent creation from system events, own-list/unread-count/read behavior, and pagination. MVP is in-app notifications only unless scope changes.

### 6.17 `modules/balance/`
**Owns:** `LEDGER_ENTRY`, `BANK_TOPUP`, `PLATFORM_SETTING`. `PROVIDER_PROFILE` may have a balance cache, but the balance module updates it through a documented provider-profile interface rather than taking ownership of the entire profile model.

Suggested files: balance routes/controller/service/validation/models and internal handlers.

Client endpoints: `GET /api/provider/balance`, `GET /api/provider/ledger`, `POST /api/provider/top-up-notices`.

Internal endpoints: `POST /internal/balances/top-ups`, `POST /internal/providers/:id/balance-adjustments`, `GET /internal/providers/:id/ledger`, `PATCH /internal/platform-settings/commission-rate`.

Owns balance/ledger reads, top-up notices/recording, adjustments, commission configuration, append-only ledger entries, and balance rules exposed as interfaces to Booking/Offer workflows. Completing a booking and deducting a commission must be atomic and idempotent.

## 7. Model ownership map

| Model | Owning module | Database |
|---|---|---|
| `USER`, `OTP_CODE`, `REFRESH_TOKEN` | `auth` | Client DB |
| `PATIENT_PROFILE` | `patient-profile` | Client DB |
| `PATIENT_VERIFICATION` | `patient-verification` | Client DB |
| `PROFESSION`, `SERVICE_CATALOG` | `catalog` | Client DB |
| `PROVIDER_PROFILE` | `provider-profile` | Client DB |
| `PROVIDER_APPLICATION` | `provider-application` | Client DB |
| `PROVIDER_DOCUMENT` | `provider-documents` | Client DB |
| `ASSESSMENT` (pending canonical-model decision) | `assessments` | Client DB |
| `PROVIDER_SERVICE_ACCESS`, `SERVICE` | `provider-services` | Client DB |
| `SERVICE_REQUEST` | `service-requests` | Client DB |
| `OFFER` | `offers` | Client DB |
| `BOOKING` | `bookings` | Client DB |
| `RATING` | `ratings` | Client DB |
| `NOTIFICATION` | `notifications` | Client DB |
| `LEDGER_ENTRY`, `BANK_TOPUP`, `PLATFORM_SETTING` | `balance` | Client DB |
| `ADMIN`, `ADMIN_REFRESH_TOKEN`, `AUDIT_LOG` | Not a Client API model | Admin DB |

## 8. Cross-module workflows

Use workflows only when one user/business action coordinates several modules.

### `register-client-account.workflow.js`
The current blueprint says registration creates `USER` and the role-specific starting profile/application. If retained, the workflow coordinates model-owned operations within the required transaction. `auth` still owns `USER`/OTP/tokens; each profile/application stays owned by its respective module. Finalize atomicity and failure behavior before implementation.

### `accept-offer.workflow.js`
Coordinates accepted offer, assigned request, confirmed booking creation, rejection of competing offers, and re-checks of availability/balance inside the appropriate transactional boundary.

### `complete-booking.workflow.js`
Coordinates booking completion, `paid_cash` status, one commission ledger entry, balance cache update, and protection against duplicate deductions on retry.

Do not put every operation into workflows. Use one when the use case truly crosses module boundaries.

## 9. Integrations, database helpers, jobs, and scripts

### `src/integrations/`
- `sms/`: adapter for the chosen SMS service; OTP rules remain in Auth.
- `google/`: Google ID-token verification; account/role logic remains in Auth.
- `storage/`: storage adapter and authorized file references/signed URLs; record ownership remains in the domain module.

Keep vendor-specific SDK details out of domain services and keep providers configurable until selected.

### `src/database/transaction.js`
Optional common helper for supported MongoDB transactions. Use for all-or-nothing multi-document operations only. Confirm deployment supports transactions before relying on them.

### `src/jobs/`
Candidate scheduled jobs based on the current blueprint:
- Expire service requests.
- Expire time proposals.
- Create/send booking reminders.
- Move confirmed bookings to `upcoming` at the agreed time.
- Remove old notifications if the retention policy is approved.

Each job must be idempotent or protected against duplicate execution. Scheduling/retry mechanisms are not assumed to be implemented yet.

### `src/scripts/`
- `seed-professions.js`
- `seed-service-catalog.js`

Seed scripts should be repeatable or explicitly reject duplicate setup. Initial Admin super-admin provisioning belongs to the Admin project.

## 10. Naming conventions

- Folders: lowercase kebab-case (`patient-verification`).
- Files: descriptive kebab-case with role suffix (`patient-verification.service.js`).
- Model filenames: singular domain name (`provider-document.model.js`).
- Functions/variables: `camelCase`.
- Keep ESM/CommonJS consistent with the existing project; do not switch module systems just to match this document.
- Routes define HTTP endpoints; Controllers translate HTTP; Services own business rules.
- Avoid catch-all files such as `misc.js` or `helpers.js` when the responsibility belongs to a feature.

## 11. API-to-module ownership map

| Endpoint group | Owner |
|---|---|
| `/api/auth/*` | `auth` |
| `/api/uploads` | `uploads` |
| `/api/patient/profile` | `patient-profile` |
| `/api/patient/verification` | `patient-verification` |
| `/api/catalog/*` | `catalog` |
| `/api/services*`, `/api/providers/:id` | `public-browse` |
| `/api/provider/profile` | `provider-profile` |
| `/api/provider/application*` | `provider-application` |
| `/api/provider/documents*` | `provider-documents` |
| `/api/provider/assessments*` | `assessments` |
| `/api/provider/services*`, `/api/provider/service-requests` | `provider-services` |
| `/api/bookings*`, `/api/provider/bookings*` | `bookings` |
| `/api/requests*` | `service-requests` |
| `/api/provider/requests*`, `/api/provider/offers*`, accept-offer endpoint | `offers` |
| `/api/bookings/:id/rating` | `ratings` |
| `/api/notifications*` | `notifications` |
| `/api/provider/balance`, `/api/provider/ledger`, `/api/provider/top-up-notices` | `balance` |

Internal endpoints are defined in their owning modules and aggregated under `/internal` by `internal.routes.js`. The aggregator does not hold domain logic.

## 12. Security and API contracts

- Keep Client JWT configuration separate from Admin JWT configuration.
- `.env` must never be committed. Frontend-visible environment variables must not contain secrets.
- Validate all request body/query/path inputs using the project's selected validation library (the specification proposes Zod).
- Apply security headers, strict CORS allowlist, and risk-based rate limits.
- Store only OTP hashes and refresh-token hashes, not raw values.
- Never log passwords, OTPs, tokens, full phone numbers, identity-document URLs, selfie URLs, health information, or similarly sensitive data.
- Enforce role and ownership checks in the backend for every protected resource.
- Use private storage and short-lived authorized access for identity/provider documents.
- Protect `/internal/*` with service-to-service authentication, narrow permissions, and the defined deployment controls. A user JWT is not sufficient.
- Never serialize a full Mongoose record to the API without a safe projection/DTO.

The documented response envelopes are:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Request failed", "error": { "code": "ERROR_CODE" } }
```

Finalize the exact `error` object shape across all specifications before implementation. Paginated endpoints should follow the contract's `page`/`limit` behavior.

## 12A. Centralized errors — one policy, not one giant try/catch file

**Decision: all API errors use one global error-handling pipeline.** Individual features still detect domain-specific problems, but they do not format their own response envelopes.

Target responsibilities:

- `src/shared/errors/app-error.js`: a safe, expected application error type carrying `statusCode`, stable `code`, and a safe client-facing message.
- `src/shared/errors/error-codes.js`: centrally documented error codes (for example `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`). Add feature-specific codes here or in a documented namespaced registry, but keep the response contract consistent.
- `src/shared/errors/map-error.js`: maps known validation, MongoDB duplicate-key, JWT, and other expected library errors into the agreed application error format. Do not expose stack traces or raw database/vendor errors to clients.
- `src/middlewares/errorHandler.js` (existing file): the single Express error middleware; logs the internal details safely and sends the standard public response.
- `src/middlewares/notFound.js` (existing file): converts unmatched routes into the same standard error pipeline, rather than inventing a separate response format.
- Controllers call `next(error)` or use one consistent async-handler approach. They must not each write their own error JSON.

Expected errors are not necessarily server errors. Validation errors should be 400/422 according to the finalized contract; unauthenticated is 401; forbidden is 403; missing resources are 404; state conflicts are 409; rate limits are 429; unexpected errors are 500. Final status/code mapping must be documented once and tested.

Never return `err.stack`, MongoDB internals, secrets, token values, OTPs, private document URLs, or sensitive personal data in production responses. Log correlation/request ID and safe metadata, not secrets.

## 12B. Centralized API contract — one source for the frontend, distributed implementation

**Decision: the frontend gets one consolidated API reference, but runtime endpoints remain inside their owning feature modules.** Do not put every route/controller in one enormous `api.js` file.

Use these layers:

1. `src/modules/<feature>/<feature>.routes.js` defines the actual routes owned by that feature.
2. `src/routes/api.routes.js` mounts all client-facing feature routers under `/api`.
3. `src/routes/internal.routes.js` mounts only protected Admin-to-Client endpoints under `/internal`.
4. `docs/api/client-api.openapi.yaml` is the consolidated OpenAPI contract for the frontend: method, path, auth, roles, path/query/body schemas, success response, errors, and pagination. It documents the public Client API only.
5. `docs/api/internal-api.openapi.yaml` documents service-to-service routes separately; do not expose these as frontend endpoints.
6. A small API contract check in CI/tests should detect important drift between documented paths and mounted routes. If OpenAPI generation is introduced, choose one source-of-truth strategy and do not manually maintain two competing inventories.

The frontend should be able to use the consolidated public contract without needing to know the internal folder structure. Feature routes remain modular for maintainability. A single API document is a catalogue/contract, not a replacement for modular route files.

Recommended contract fields for each operation: `operationId`, method/path, summary, authentication requirement, allowed role, request params/query/body, success status/schema, known error codes, pagination shape, and example. Keep examples free of real personal data.

## 12C. Shared success response and DTO policy

Use one response shape across the API, with exceptions only when explicitly documented:

```json
{ "success": true, "data": {} }
```

Errors:

```json
{
  "success": false,
  "message": "A safe user-facing message",
  "error": { "code": "VALIDATION_ERROR", "details": [] },
  "requestId": "optional-correlation-id"
}
```

Finalize whether `details` is always present or omitted when empty. Do not mix several envelope formats. Services return domain results/errors; controllers or shared response helpers translate those to HTTP. Use explicit DTO/safe projection functions rather than returning raw Mongoose documents. Pagination should use one consistent shape (for example `items`, `page`, `limit`, `total`, `totalPages`) after it is aligned with the existing API specification.

## 12D. Libraries and dependency policy

First audit the current `package.json` and lockfile. **Do not reinstall or replace dependencies blindly.** Keep working versions unless there is a clear compatibility/security reason to change them. The following is the target responsibility map, not an instruction to install every package now:

| Concern | Preferred option | Policy |
|---|---|---|
| HTTP server | `express` | Keep the version already in the project unless upgrade is justified. |
| MongoDB ODM | `mongoose` | One Client DB connection; feature-owned models. |
| Environment variables | existing `dotenv` setup or Node-supported env loading | `config/env.js` validates and exports typed/normalized config; never scatter `process.env` reads throughout modules. |
| Security headers | `helmet` | Central setup in app/security config. |
| CORS | `cors` | Central allowlist; never wildcard origins when credentials are enabled. |
| Request validation | `zod` (proposed) | One schema per request/feature; add only after checking current dependencies. |
| Client JWT | existing `jsonwebtoken` or the already-selected JWT library | Do not mix libraries or use Admin signing keys. |
| Password hashing, if password auth is in scope | existing `bcrypt`/`bcryptjs` choice | OTP/Google flows do not imply passwords are required; align with auth spec first. |
| Rate limiting | `express-rate-limit` or equivalent already present | Apply stricter policies to OTP/login and suitable policies elsewhere. |
| Logging | `pino` or existing logger | Choose one; structured logs and redact secrets/PII. Do not add two logging stacks. |
| API documentation | OpenAPI YAML; optional Swagger UI package for local development | Contract file is the source of truth; Swagger UI is a viewer, not a second contract. |
| Tests | Node test runner or the project's existing Jest/Vitest setup; Supertest for HTTP tests if appropriate | Choose based on existing setup, not by installing multiple test frameworks. |
| Scheduled jobs | existing scheduler or a deliberate choice later | No job framework until requirements and deployment strategy are confirmed. |
| File storage / SMS / Google | provider SDK behind `src/integrations/*` adapters | Do not couple business modules to a vendor SDK. |

Dependency rules:

- One package should have one clear purpose; avoid duplicate libraries that solve the same problem.
- Keep provider-specific integrations behind adapters so SMS/storage/Google vendors can be switched without rewriting feature services.
- Pin and lock dependencies through `package-lock.json`; review production dependencies and vulnerabilities before release.
- Do not add Redis, queues, microservices, dependency-injection frameworks, or feature-flag services without a concrete requirement.
- Avoid installing packages just because they appear in this architecture document. Dependency changes happen after the current package inventory and compatibility are reviewed.

## 12E. Configuration switches / feature flags

Use environment configuration for deployment-specific settings and a small, explicit feature-flag module only when a feature genuinely needs a controlled rollout. Do not scatter string checks such as `process.env.SOME_FLAG` across controllers.

Suggested design:

- `src/config/env.js`: parses and validates environment variables once at startup.
- `src/config/features.js` (only if feature flags are needed): exports named booleans/config values such as `enableGoogleAuth`, `enableSmsOtp`, or `enableTopUps`; names must match real approved requirements.
- `src/config/cors.js` and `src/config/security.js`: environment-specific allowlists and security settings.
- `.env.example`: documents required variables with fake/example values only.
- Missing required secrets/config should fail startup clearly; optional integrations may be disabled only if the application can safely operate without them.

Rules for switches:

1. Environment config controls deployment values (port, DB URI, allowed origins, token secrets, provider credentials).
2. Feature flags control intentional on/off behavior; they do not replace authorization or validation.
3. A disabled feature must return a documented response (typically 404 or 503 depending on whether it is hidden or temporarily unavailable); decide per feature rather than guessing in each controller.
4. Never use a client-controlled request header/query parameter as a security switch.
5. Do not create flags for every route by default. Start with only integrations or release-sensitive features that need a real toggle.

## 12F. API request lifecycle

Use one predictable path for requests:

`Request → request ID/log context → security/CORS/body parsing → route aggregator → route-specific rate limit → authentication → role/ownership checks → validation → controller → feature service/workflow → model/integration → shared success response → global error handler on failure`.

The exact middleware order can differ for routes that must rate-limit before authentication (such as OTP). Ownership checks stay in the owning service, not only in the role middleware. Internal routes must pass service authentication before any internal controller runs.

## 13. Where architecture documentation lives

Recommended documentation layout, reusing existing docs instead of duplicating the canonical ERD/schema/API definitions:

```text
TabibiGo/docs/
├── architecture/
│   ├── client-api-architecture.md
│   ├── system-boundaries.md
│   └── decisions/
│       ├── ADR-001-modular-monolith.md
│       ├── ADR-002-internal-api-auth.md
│       └── ADR-003-registration-transaction.md
├── features/
│   ├── 01-auth/
│   ├── 02-provider-onboarding/
│   ├── 03-service-verification/
│   ├── 04-patient-profile-verification/
│   ├── 05-browse-booking/
│   ├── 06-requests-offers/
│   ├── 07-notifications/
│   └── 08-balance-commission/
└── api/
    ├── client-api.md
    └── internal-api.md
```

This docs layout is a proposal, not a claim that these folders already exist. Existing ERD, Schema, API Specification, and Feature Blueprint files should remain the canonical references or be linked from the new architecture document. Do not keep two competing versions of the same contract.

A feature documentation folder can include whichever artifacts actually exist: `requirements.md`, `erd.md`/canonical reference, `schema.md`, `endpoints.md`, `flows.md`, `acceptance-criteria.md`, `open-decisions.md`.

## 14. Conflicts to resolve before implementation

1. **Assessment model:** earlier ERD has `INTERVIEW` and `PRACTICAL_EXAM`; expanded specification has a shared `ASSESSMENT` with a type. Choose one canonical design before creating models.
2. **Registration transaction:** Auth currently describes creating the role-specific profile/application. Confirm transaction atomicity and failure behavior while preserving module ownership.
3. **Refresh-token transport:** one API contract lists `refreshToken` in request body, while another proposes an HttpOnly Secure cookie. Finalize transport before coding.
4. **OTP state:** state-machine docs mention active/consumed/invalidated/expired, but the field list primarily has `consumedAt`, `expiresAt`, and attempts. Decide whether the state is derived or persisted, including how invalidation is represented.
5. **Internal actor metadata:** define how `X-Admin-Id` is trusted, exactly which service operations can be called, and how idempotency/audit requirements work.
6. **Balance cache ownership:** if balance is cached on `PROVIDER_PROFILE`, define an explicit provider-profile interface used by the balance workflow rather than having two modules claim the same model.
7. **Endpoint inventory:** the 60 public/19 internal counts are documentation totals; verify against the final canonical API contracts.

## 15. Architecture sign-off checklist

- [ ] Current `client-api` files have been audited and the backend foundation is preserved.
- [ ] Module names and responsibilities are approved.
- [ ] Every API endpoint is assigned to one owner module.
- [ ] Each model has exactly one owning module.
- [ ] Internal endpoints are separated and protected.
- [ ] Cross-module workflows and transaction boundaries are documented.
- [ ] Client/Admin database and token boundaries are respected.
- [ ] Refresh-token transport is finalized.
- [ ] The canonical Assessment data model is selected.
- [ ] Response/error and security conventions are consistent.
- [ ] Public endpoints are documented in one consolidated OpenAPI contract while implementation stays feature-based.
- [ ] Existing dependencies have been audited before any package is added or replaced.
- [ ] Environment config and any real feature switches have one central owner.
- [ ] Existing documentation is reused without competing duplicates.

## 16. Recommended next step

1. Save this document as `TabibiGo/client-api/ARCHITECTURE.md`, or place it under the existing docs convention and link it from the Client API README.
2. Compare this target tree against the actual `TabibiGo/client-api` folder and preserve current foundation files.
3. Approve module ownership and resolve Section 14 decisions.
4. Only then detail the `auth` module file by file (models, routes, controllers, services, validation, flows, and error contracts) before implementation.
