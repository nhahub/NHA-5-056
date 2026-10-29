# TabibiGo Client API — Target File/Folder Structure

**Purpose:** scaffolding plan only. All newly created files are to remain completely empty. Existing files must remain untouched. This tree describes the target layout; it does not claim that the listed features are implemented.

```text
client-api/
├── .env                                      [existing — do not read, print, or modify]
├── .env.example                              [existing — do not modify]
├── .gitignore                                [create empty only if missing]
├── package.json                              [existing — do not modify]
├── package-lock.json                         [existing — do not modify]
├── README.md                                 [create empty only if missing]
│
├── src/
│   ├── app.js                                [existing — preserve]
│   ├── server.js                             [existing — preserve]
│   ├── CLIENT_API_ARCHITECTURE.md            [existing — preserve]
│   │
│   ├── config/
│   │   ├── env.js                            [existing — preserve]
│   │   ├── database.js                       [existing — preserve]
│   │   ├── cors.js                           [create empty if missing]
│   │   ├── security.js                       [create empty if missing]
│   │   └── features.js                       [create empty if missing; feature switches only]
│   │
│   ├── routes/
│   │   ├── api.routes.js                     [create empty if missing]
│   │   ├── internal.routes.js                [create empty if missing]
│   │   └── health.routes.js                  [create empty if missing]
│   │
│   ├── middlewares/
│   │   ├── authenticate.js                   [existing — preserve]
│   │   ├── authorizeRoles.js                 [existing — preserve]
│   │   ├── errorHandler.js                   [existing — preserve]
│   │   ├── notFound.js                       [existing — preserve]
│   │   ├── requireServiceAuth.js              [create empty if missing]
│   │   ├── validateRequest.js                 [create empty if missing]
│   │   └── rateLimit.js                      [create empty if missing]
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js                [existing — preserve]
│   │   │   ├── auth.controller.js            [existing — preserve]
│   │   │   ├── auth.service.js               [existing — preserve]
│   │   │   ├── auth.validation.js            [create empty if missing]
│   │   │   ├── auth.constants.js              [create empty if missing]
│   │   │   ├── services/
│   │   │   │   ├── otp.service.js             [create empty if missing]
│   │   │   │   ├── google-auth.service.js     [create empty if missing]
│   │   │   │   └── token.service.js            [create empty if missing]
│   │   │   └── models/
│   │   │       ├── user.model.js             [create empty if missing]
│   │   │       ├── otp-code.model.js         [create empty if missing]
│   │   │       └── refresh-token.model.js    [create empty if missing]
│   │   │
│   │   ├── uploads/
│   │   │   ├── uploads.routes.js
│   │   │   ├── uploads.controller.js
│   │   │   ├── uploads.service.js
│   │   │   └── uploads.validation.js
│   │   │
│   │   ├── patient-profile/
│   │   │   ├── patient-profile.routes.js
│   │   │   ├── patient-profile.controller.js
│   │   │   ├── patient-profile.service.js
│   │   │   ├── patient-profile.validation.js
│   │   │   └── models/patient-profile.model.js
│   │   │
│   │   ├── patient-verification/
│   │   │   ├── patient-verification.routes.js
│   │   │   ├── patient-verification.controller.js
│   │   │   ├── patient-verification.service.js
│   │   │   ├── patient-verification.validation.js
│   │   │   ├── models/patient-verification.model.js
│   │   │   └── internal/
│   │   │       ├── patient-verification.internal.routes.js
│   │   │       └── patient-verification.internal.controller.js
│   │   │
│   │   ├── catalog/
│   │   │   ├── catalog.routes.js
│   │   │   ├── catalog.controller.js
│   │   │   ├── catalog.service.js
│   │   │   ├── catalog.validation.js
│   │   │   └── models/
│   │   │       ├── profession.model.js
│   │   │       └── service-catalog.model.js
│   │   │
│   │   ├── provider-profile/
│   │   │   ├── provider-profile.routes.js
│   │   │   ├── provider-profile.controller.js
│   │   │   ├── provider-profile.service.js
│   │   │   ├── provider-profile.validation.js
│   │   │   ├── models/provider-profile.model.js
│   │   │   └── internal/
│   │   │       ├── provider-profile.internal.routes.js
│   │   │       └── provider-profile.internal.controller.js
│   │   │
│   │   ├── provider-application/
│   │   │   ├── provider-application.routes.js
│   │   │   ├── provider-application.controller.js
│   │   │   ├── provider-application.service.js
│   │   │   ├── provider-application.validation.js
│   │   │   ├── models/provider-application.model.js
│   │   │   └── internal/
│   │   │       ├── provider-application.internal.routes.js
│   │   │       └── provider-application.internal.controller.js
│   │   │
│   │   ├── provider-documents/
│   │   │   ├── provider-documents.routes.js
│   │   │   ├── provider-documents.controller.js
│   │   │   ├── provider-documents.service.js
│   │   │   ├── provider-documents.validation.js
│   │   │   ├── models/provider-document.model.js
│   │   │   └── internal/
│   │   │       ├── provider-documents.internal.routes.js
│   │   │       └── provider-documents.internal.controller.js
│   │   │
│   │   ├── assessments/
│   │   │   ├── assessments.routes.js
│   │   │   ├── assessments.controller.js
│   │   │   ├── assessments.service.js
│   │   │   ├── assessments.validation.js
│   │   │   └── internal/
│   │   │       ├── assessments.internal.routes.js
│   │   │       └── assessments.internal.controller.js
│   │   │   # No assessment model file yet: documentation conflicts between
│   │   │   # one ASSESSMENT model and separate INTERVIEW/PRACTICAL_EXAM models.
│   │   │
│   │   ├── provider-services/
│   │   │   ├── provider-services.routes.js
│   │   │   ├── provider-services.controller.js
│   │   │   ├── provider-services.service.js
│   │   │   ├── provider-services.validation.js
│   │   │   ├── models/
│   │   │   │   ├── provider-service-access.model.js
│   │   │   │   └── service.model.js
│   │   │   └── internal/
│   │   │       ├── provider-services.internal.routes.js
│   │   │       └── provider-services.internal.controller.js
│   │   │
│   │   ├── public-browse/
│   │   │   ├── public-browse.routes.js
│   │   │   ├── public-browse.controller.js
│   │   │   ├── public-browse.service.js
│   │   │   └── public-browse.validation.js
│   │   │
│   │   ├── bookings/
│   │   │   ├── patient-booking.routes.js
│   │   │   ├── provider-booking.routes.js
│   │   │   ├── patient-booking.controller.js
│   │   │   ├── provider-booking.controller.js
│   │   │   ├── booking.service.js
│   │   │   ├── booking.validation.js
│   │   │   ├── booking.constants.js
│   │   │   └── models/booking.model.js
│   │   │
│   │   ├── service-requests/
│   │   │   ├── service-requests.routes.js
│   │   │   ├── service-requests.controller.js
│   │   │   ├── service-requests.service.js
│   │   │   ├── service-requests.validation.js
│   │   │   └── models/service-request.model.js
│   │   │
│   │   ├── offers/
│   │   │   ├── offers.routes.js
│   │   │   ├── offers.controller.js
│   │   │   ├── offers.service.js
│   │   │   ├── offers.validation.js
│   │   │   └── models/offer.model.js
│   │   │
│   │   ├── ratings/
│   │   │   ├── ratings.routes.js
│   │   │   ├── ratings.controller.js
│   │   │   ├── ratings.service.js
│   │   │   ├── ratings.validation.js
│   │   │   └── models/rating.model.js
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.routes.js
│   │   │   ├── notifications.controller.js
│   │   │   ├── notifications.service.js
│   │   │   ├── notifications.validation.js
│   │   │   ├── notification-events.js
│   │   │   └── models/notification.model.js
│   │   │
│   │   └── balance/
│   │       ├── balance.routes.js
│   │       ├── balance.controller.js
│   │       ├── balance.service.js
│   │       ├── balance.validation.js
│   │       ├── models/
│   │       │   ├── ledger-entry.model.js
│   │       │   ├── bank-topup.model.js
│   │       │   └── platform-setting.model.js
│   │       └── internal/
│   │           ├── balance.internal.routes.js
│   │           └── balance.internal.controller.js
│   │
│   ├── workflows/
│   │   ├── register-client-account.workflow.js
│   │   ├── accept-offer.workflow.js
│   │   └── complete-booking.workflow.js
│   │
│   ├── integrations/
│   │   ├── sms/sms.adapter.js
│   │   ├── google/google-auth.adapter.js
│   │   └── storage/storage.adapter.js
│   │
│   ├── database/
│   │   └── transaction.js
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── app-error.js
│   │   │   ├── error-codes.js
│   │   │   └── map-error.js
│   │   ├── responses/
│   │   │   └── success-response.js
│   │   ├── logging/logger.js
│   │   ├── constants/
│   │   │   ├── roles.js
│   │   │   └── http-status.js
│   │   └── utils/
│   │       ├── async-handler.js
│   │       ├── pagination.js
│   │       └── safe-projection.js
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
├── docs/
│   └── api/
│       ├── client-api.openapi.yaml
│       └── internal-api.openapi.yaml
│
└── tests/
    ├── unit/.gitkeep
    ├── integration/.gitkeep
    └── e2e/.gitkeep
```

## Notes for the scaffolding pass

- Every **newly created file** must be zero bytes. Do not add comments, imports, exports, YAML fields, JSON, Markdown, or placeholder code.
- Existing files listed above must not be changed, moved, renamed, or overwritten.
- Keep the existing `src/CLIENT_API_ARCHITECTURE.md` in place for now; do not duplicate its content into another file.
- Do not create an `ASSESSMENT` model or `INTERVIEW`/`PRACTICAL_EXAM` model file until that schema conflict is resolved.
- This is a folder/file scaffold only. Empty source files do not mean a feature has been implemented.
- An empty `.gitignore` does not protect `.env`; do not commit until ignore rules are added in a later, separate step.
