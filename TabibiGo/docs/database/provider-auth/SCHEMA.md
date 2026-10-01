# TabibiGo — Provider Authentication & Verification Database Schema

> **Status:** Blueprint · **Version:** 1.0 · **Last Updated:** 2026-10-01

---

## Scope

This schema reference documents all entities involved in the **Provider Authentication and Verification** pipeline of the TabibiGo platform. It covers:

- Client-side user accounts and provider professional profiles
- The provider application and its full lifecycle
- Supporting documents, interview records, and practical exam records
- Admin accounts and their review traceability across all entities

This document serves as the definitive field-level reference for backend implementation. It does not contain application code, Mongoose schemas, or implementation logic.

---

## Entities

1. [User](#1-user)
2. [ProviderProfile](#2-providerprofile)
3. [ProviderApplication](#3-providerapplication)
4. [ProviderDocument](#4-providerdocument)
5. [Interview](#5-interview)
6. [PracticalExam](#6-practicalexam)
7. [Admin](#7-admin)

---

## 1. User

### Purpose

Represents a registered client-side user account. The `User` entity is responsible for authentication and identity only. It covers both patients and providers — the `role` field distinguishes between them. Professional provider information is stored separately in `ProviderProfile`.

### Fields

| Field | Type | Required | Key | Description |
|---|---|---|---|---|
| `_id` | ObjectId | ✅ | PK | Unique document identifier, auto-generated |
| `role` | String (enum) | ✅ | — | Account role. Allowed values: `patient`, `provider` |
| `email` | String | ✅ | Unique | User's email address. Used for login and contact |
| `phone` | String | ❌ | — | User's phone number |
| `passwordHash` | String | ❌ | — | Bcrypt hash of the user's password. See security note below |
| `googleId` | String | ❌ | — | Google OAuth identifier. Present only for Google-authenticated users |
| `emailVerified` | Boolean | ✅ | — | Whether the user's email address has been verified |
| `phoneVerified` | Boolean | ✅ | — | Whether the user's phone number has been verified |
| `isActive` | Boolean | ✅ | — | Whether the account is currently active |
| `createdAt` | Date | ✅ | — | Timestamp when the account was created |
| `updatedAt` | Date | ✅ | — | Timestamp of the last update |

### Role Values

| Value | Description |
|---|---|
| `patient` | A user who books services |
| `provider` | A user who offers services and may submit a verification application |

### Security

> ⚠️ `passwordHash` stores **only the bcrypt hash** of the user's password.
> Plain-text passwords must **never** be stored in the database under any circumstances.
> `passwordHash` may be `null` for users who authenticate exclusively via Google OAuth.

---

## 2. ProviderProfile

### Purpose

Stores the professional profile of a provider. This entity is created when a user with `role: provider` begins building their profile. It is persistent and separate from the `ProviderApplication` — the profile describes who the provider is, while the application is a discrete verification event.

### Fields

| Field | Type | Required | Key | Description |
|---|---|---|---|---|
| `_id` | ObjectId | ✅ | PK | Unique document identifier, auto-generated |
| `userId` | ObjectId | ✅ | FK → User._id | References the User account that owns this profile |
| `fullName` | String | ✅ | — | Provider's full legal name |
| `profilePhoto` | String | ❌ | — | URL reference to the provider's profile photo (stored externally) |
| `bio` | String | ❌ | — | Short professional biography |
| `location` | String | ❌ | — | Provider's general location or city |
| `professionId` | ObjectId | ❌ | — | References the provider's primary profession |
| `specializationIds` | ObjectId[] | ❌ | — | Array of specialization references |
| `yearsOfExperience` | Number | ❌ | — | Number of years of professional experience |
| `education` | String | ❌ | — | Educational background description |
| `certifications` | String | ❌ | — | Relevant certifications held by the provider |
| `professionalLicense` | String | ❌ | — | Professional license number or reference |
| `previousExperience` | String | ❌ | — | Summary of previous professional experience |
| `serviceArea` | String | ❌ | — | Geographic area(s) where the provider offers services |
| `availability` | Object | ❌ | — | Structured availability schedule |
| `createdAt` | Date | ✅ | — | Timestamp when the profile was created |
| `updatedAt` | Date | ✅ | — | Timestamp of the last profile update |

### Relationships

| Relationship | Foreign Key | Cardinality |
|---|---|---|
| Belongs to User | `userId → User._id` | 1 User : 1 ProviderProfile |

---

## 3. ProviderApplication

### Purpose

Represents a formal provider verification application. A provider submits an application to be reviewed and approved by an admin. A provider may have multiple applications over time (e.g., after rejection and resubmission). Each application has an independent lifecycle tracked by `status`.

### Fields

| Field | Type | Required | Key | Description |
|---|---|---|---|---|
| `_id` | ObjectId | ✅ | PK | Unique document identifier, auto-generated |
| `providerId` | ObjectId | ✅ | FK → ProviderProfile._id | References the provider who submitted this application |
| `professionId` | ObjectId | ✅ | — | The profession being applied for |
| `specializationIds` | ObjectId[] | ❌ | — | Specializations declared in this application |
| `professionalInformation` | Object | ❌ | — | Structured professional information submitted with this application |
| `status` | String (enum) | ✅ | — | Current lifecycle status of the application. See status table below |
| `rejectionReason` | String | ❌ | — | Explanation provided when an application is rejected. Null if not rejected |
| `submittedAt` | Date | ❌ | — | Timestamp when the application was formally submitted |
| `reviewedAt` | Date | ❌ | — | Timestamp when the application was reviewed by an admin |
| `reviewedBy` | ObjectId | ❌ | FK → Admin._id | References the Admin who performed the review |
| `createdAt` | Date | ✅ | — | Timestamp when the application record was created |
| `updatedAt` | Date | ✅ | — | Timestamp of the last update |

### Application Status Lifecycle

| Status | Description |
|---|---|
| `draft` | The application has been created but not yet formally submitted by the provider |
| `submitted` | The provider has submitted the application and it is awaiting admin review |
| `under_review` | An admin has opened and is actively reviewing the application |
| `interview_required` | The admin has determined that an interview is required before a decision can be made |

### Field Notes

- `rejectionReason` is populated when an application is rejected. It must be `null` for all other statuses.
- `reviewedAt` is `null` until an admin performs a review action on the application.
- `reviewedBy` is `null` until an admin performs a review action. Once set, it identifies the responsible admin for audit purposes.

### Relationships

| Relationship | Foreign Key | Cardinality |
|---|---|---|
| Belongs to ProviderProfile | `providerId → ProviderProfile._id` | 1 ProviderProfile : N ProviderApplication |
| Reviewed by Admin | `reviewedBy → Admin._id` | 1 Admin : N ProviderApplication |

---

## 4. ProviderDocument

### Purpose

Represents a single document submitted by a provider as part of a verification application. Documents are reviewed independently — each document has its own status, allowing granular admin review without blocking the entire application on a single file. The physical file is stored in an external storage service; the database holds only the reference.

### Fields

| Field | Type | Required | Key | Description |
|---|---|---|---|---|
| `_id` | ObjectId | ✅ | PK | Unique document identifier, auto-generated |
| `applicationId` | ObjectId | ✅ | FK → ProviderApplication._id | References the application this document belongs to |
| `providerId` | ObjectId | ✅ | FK → ProviderProfile._id | References the provider who submitted the document |
| `documentType` | String | ✅ | — | Category or type of document (e.g., national ID, medical license) |
| `fileUrl` | String | ✅ | — | URL reference to the file stored in external storage |
| `fileName` | String | ✅ | — | Original file name as uploaded by the provider |
| `status` | String (enum) | ✅ | — | Current review status of the document. See status table below |
| `rejectionReason` | String | ❌ | — | Explanation provided when a document is rejected. Null otherwise |
| `reviewedAt` | Date | ❌ | — | Timestamp when the document was reviewed. Null until reviewed |
| `reviewedBy` | ObjectId | ❌ | FK → Admin._id | References the Admin who reviewed the document. Null until reviewed |
| `createdAt` | Date | ✅ | — | Timestamp when the document record was created |
| `updatedAt` | Date | ✅ | — | Timestamp of the last update |

### Document Status Values

| Status | Description |
|---|---|
| `pending` | The document has been submitted and is awaiting admin review |
| `approved` | The admin has verified and approved the document |
| `rejected` | The admin has rejected the document. `rejectionReason` will be populated |

### Document Rules

- Each document belongs to exactly one application (`applicationId`) and one provider (`providerId`).
- Each document can be reviewed independently of other documents in the same application.
- `rejectionReason` is populated only when `status` is `rejected`; it is `null` otherwise.
- `reviewedAt` is `null` until an admin performs a review action on this document.
- `reviewedBy` is `null` until reviewed. Once set, it identifies the admin responsible.
- The physical file is stored **outside the database** in an external file storage service.
- `fileUrl` stores the URL or path reference to the external file location.

### Relationships

| Relationship | Foreign Key | Cardinality |
|---|---|---|
| Belongs to ProviderApplication | `applicationId → ProviderApplication._id` | 1 ProviderApplication : N ProviderDocument |
| Belongs to ProviderProfile | `providerId → ProviderProfile._id` | 1 ProviderProfile : N ProviderDocument |
| Reviewed by Admin | `reviewedBy → Admin._id` | 1 Admin : N ProviderDocument |

---

## 5. Interview

### Purpose

Represents a single interview record associated with a provider application. An interview is created when an admin determines that a provider must be interviewed as part of the verification process. Each interview has an independent scheduling lifecycle (`status`) and an independent evaluation result (`result`). Multiple interview records may exist for the same application.

### Fields

| Field | Type | Required | Key | Description |
|---|---|---|---|---|
| `_id` | ObjectId | ✅ | PK | Unique document identifier, auto-generated |
| `applicationId` | ObjectId | ✅ | FK → ProviderApplication._id | References the application this interview is associated with |
| `interviewType` | String (enum) | ✅ | — | Format of the interview. Allowed values: `online`, `offline` |
| `scheduledAt` | Date | ✅ | — | Date and time the interview is scheduled to take place |
| `meetingUrl` | String | ❌ | — | Video call URL. Used when `interviewType` is `online` |
| `location` | String | ❌ | — | Physical location. Used when `interviewType` is `offline` |
| `description` | String | ❌ | — | Additional instructions or context for the interview |
| `status` | String (enum) | ✅ | — | Scheduling and lifecycle state of the interview. See status table below |
| `notes` | String | ❌ | — | Admin notes recorded after the interview |
| `result` | String (enum) | ✅ | — | Evaluation outcome of the interview. See result table below |
| `reviewedBy` | ObjectId | ❌ | FK → Admin._id | References the Admin who managed or evaluated the interview |
| `createdAt` | Date | ✅ | — | Timestamp when the interview record was created |
| `updatedAt` | Date | ✅ | — | Timestamp of the last update |

### Interview Type Values

| Value | Description |
|---|---|
| `online` | Conducted remotely via video call. `meetingUrl` should be populated |
| `offline` | Conducted in person. `location` should be populated |

### Interview Status Values

| Status | Description |
|---|---|
| `scheduled` | The interview has been scheduled and is upcoming |
| `completed` | The interview has taken place |
| `cancelled` | The interview was cancelled |
| `rescheduled` | The interview was rescheduled. A new record reflects the updated time |

### Interview Result Values

| Result | Description |
|---|---|
| `pending` | The interview has not yet been evaluated |
| `passed` | The provider passed the interview |
| `failed` | The provider did not pass the interview |

### Interview Rules

- `status` and `result` are **separate, independent fields**. Status tracks the scheduling lifecycle; result tracks the evaluation outcome.
- `meetingUrl` is used for `online` interviews; `location` is used for `offline` interviews.
- Multiple interview records may exist for the same application (e.g., after rescheduling).

### Relationships

| Relationship | Foreign Key | Cardinality |
|---|---|---|
| Belongs to ProviderApplication | `applicationId → ProviderApplication._id` | 1 ProviderApplication : N Interview |
| Reviewed by Admin | `reviewedBy → Admin._id` | 1 Admin : N Interview |

---

## 6. PracticalExam

### Purpose

Represents a single practical exam record associated with a provider application. Practical exams allow the admin to assess a provider's hands-on competence. Like interviews, each exam has an independent lifecycle (`status`) and evaluation result (`result`). Multiple exam records may exist for the same application.

### Fields

| Field | Type | Required | Key | Description |
|---|---|---|---|---|
| `_id` | ObjectId | ✅ | PK | Unique document identifier, auto-generated |
| `applicationId` | ObjectId | ✅ | FK → ProviderApplication._id | References the application this exam is associated with |
| `examType` | String (enum) | ✅ | — | Format of the exam. Allowed values: `online`, `offline` |
| `scheduledAt` | Date | ✅ | — | Date and time the exam is scheduled to take place |
| `meetingUrl` | String | ❌ | — | Video call URL. Used when `examType` is `online` |
| `location` | String | ❌ | — | Physical location. Used when `examType` is `offline` |
| `description` | String | ❌ | — | Additional instructions or context for the exam |
| `status` | String (enum) | ✅ | — | Scheduling and lifecycle state of the exam. See status table below |
| `notes` | String | ❌ | — | Admin notes recorded after the exam |
| `result` | String (enum) | ✅ | — | Evaluation outcome of the exam. See result table below |
| `reviewedBy` | ObjectId | ❌ | FK → Admin._id | References the Admin who managed or evaluated the exam |
| `createdAt` | Date | ✅ | — | Timestamp when the exam record was created |
| `updatedAt` | Date | ✅ | — | Timestamp of the last update |

### Exam Type Values

| Value | Description |
|---|---|
| `online` | Conducted remotely via video call. `meetingUrl` should be populated |
| `offline` | Conducted in person. `location` should be populated |

### Exam Status Values

| Status | Description |
|---|---|
| `scheduled` | The exam has been scheduled and is upcoming |
| `completed` | The exam has taken place |
| `cancelled` | The exam was cancelled |
| `rescheduled` | The exam was rescheduled. A new record reflects the updated time |

### Exam Result Values

| Result | Description |
|---|---|
| `pending` | The exam has not yet been evaluated |
| `passed` | The provider passed the exam |
| `failed` | The provider did not pass the exam |

### Exam Rules

- `status` and `result` are **separate, independent fields**. Status tracks the exam lifecycle; result tracks the evaluation outcome.
- `meetingUrl` is used for `online` exams; `location` is used for `offline` exams.
- Multiple practical exam records may exist for the same application.

### Relationships

| Relationship | Foreign Key | Cardinality |
|---|---|---|
| Belongs to ProviderApplication | `applicationId → ProviderApplication._id` | 1 ProviderApplication : N PracticalExam |
| Reviewed by Admin | `reviewedBy → Admin._id` | 1 Admin : N PracticalExam |

---

## 7. Admin

### Purpose

Represents an admin-side staff account. The `Admin` entity is completely separate from the `User` entity. Admins have no patient or provider-facing presence; they exist exclusively to review and manage provider applications, documents, interviews, and practical exams. Admin authentication is handled independently by `admin-api`.

### Fields

| Field | Type | Required | Key | Description |
|---|---|---|---|---|
| `_id` | ObjectId | ✅ | PK | Unique document identifier, auto-generated |
| `role` | String (enum) | ✅ | — | Admin role level. Allowed values: `admin`, `super_admin` |
| `email` | String | ✅ | Unique | Admin's email address. Used for login |
| `passwordHash` | String | ✅ | — | Bcrypt hash of the admin's password. See security note below |
| `isActive` | Boolean | ✅ | — | Whether the admin account is currently active |
| `createdAt` | Date | ✅ | — | Timestamp when the admin account was created |
| `updatedAt` | Date | ✅ | — | Timestamp of the last update |

### Role Values

| Value | Description |
|---|---|
| `admin` | A standard admin with review and management permissions |
| `super_admin` | A privileged admin with elevated permissions |

### Relationships

| Relationship | Foreign Key | Cardinality |
|---|---|---|
| Reviews ProviderApplication | `ProviderApplication.reviewedBy → Admin._id` | 1 Admin : N ProviderApplication |
| Reviews ProviderDocument | `ProviderDocument.reviewedBy → Admin._id` | 1 Admin : N ProviderDocument |
| Reviews Interview | `Interview.reviewedBy → Admin._id` | 1 Admin : N Interview |
| Reviews PracticalExam | `PracticalExam.reviewedBy → Admin._id` | 1 Admin : N PracticalExam |

### Security

> ⚠️ **Admin authentication is completely separate from Client authentication.**
>
> - `Admin` is **NOT** part of the `User` entity and must never share a collection with it.
> - Admin credentials are managed exclusively by `admin-api`.
> - Admin JWT secrets must never be shared with or reused from `client-api`.
> - `passwordHash` stores **only the bcrypt hash** of the admin's password.
>   Plain-text passwords must **never** be stored in the database.

---

## Final Relationship Map

```
User
└── 1:1 ──► ProviderProfile
             └── 1:N ──► ProviderApplication
                          ├── 1:N ──► ProviderDocument
                          ├── 1:N ──► Interview
                          └── 1:N ──► PracticalExam

ProviderProfile
└── 1:N ──► ProviderDocument   (direct ownership, independent of application)

Admin
├── 1:N ──► ProviderApplication   (reviewedBy)
├── 1:N ──► ProviderDocument      (reviewedBy)
├── 1:N ──► Interview             (reviewedBy)
└── 1:N ──► PracticalExam         (reviewedBy)
```
