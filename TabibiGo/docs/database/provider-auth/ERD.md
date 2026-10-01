# TabibiGo — Provider Authentication & Verification ERD

> **Scope:** This diagram covers the full entity relationship model for the Provider Authentication and Verification domain.
> It includes all entities involved in the provider onboarding pipeline, from user account creation through admin review.

---

## Entity Relationship Diagram

```mermaid
erDiagram

    USER {
        ObjectId _id PK
        string   role
        string   email
        string   phone
        string   passwordHash
        string   googleId
        boolean  emailVerified
        boolean  phoneVerified
        boolean  isActive
        date     createdAt
        date     updatedAt
    }

    PROVIDER_PROFILE {
        ObjectId   _id PK
        ObjectId   userId FK
        string     fullName
        string     profilePhoto
        string     bio
        string     location
        ObjectId   professionId
        ObjectId[] specializationIds
        number     yearsOfExperience
        string     education
        string     certifications
        string     professionalLicense
        string     previousExperience
        string     serviceArea
        object     availability
        date       createdAt
        date       updatedAt
    }

    PROVIDER_APPLICATION {
        ObjectId   _id PK
        ObjectId   providerId FK
        ObjectId   professionId
        ObjectId[] specializationIds
        object     professionalInformation
        string     status
        string     rejectionReason
        date       submittedAt
        date       reviewedAt
        ObjectId   reviewedBy FK
        date       createdAt
        date       updatedAt
    }

    PROVIDER_DOCUMENT {
        ObjectId _id PK
        ObjectId applicationId FK
        ObjectId providerId FK
        string   documentType
        string   fileUrl
        string   fileName
        string   status
        string   rejectionReason
        date     reviewedAt
        ObjectId reviewedBy FK
        date     createdAt
        date     updatedAt
    }

    INTERVIEW {
        ObjectId _id PK
        ObjectId applicationId FK
        string   interviewType
        date     scheduledAt
        string   meetingUrl
        string   location
        string   description
        string   status
        string   notes
        string   result
        ObjectId reviewedBy FK
        date     createdAt
        date     updatedAt
    }

    PRACTICAL_EXAM {
        ObjectId _id PK
        ObjectId applicationId FK
        string   examType
        date     scheduledAt
        string   meetingUrl
        string   location
        string   description
        string   status
        string   notes
        string   result
        ObjectId reviewedBy FK
        date     createdAt
        date     updatedAt
    }

    ADMIN {
        ObjectId _id PK
        string   role
        string   email
        string   passwordHash
        boolean  isActive
        date     createdAt
        date     updatedAt
    }

    USER              ||--||  PROVIDER_PROFILE     : "has one"
    PROVIDER_PROFILE  ||--o{  PROVIDER_APPLICATION : "submits"
    PROVIDER_PROFILE  ||--o{  PROVIDER_DOCUMENT     : "owns"
    PROVIDER_APPLICATION ||--o{  PROVIDER_DOCUMENT  : "contains"
    PROVIDER_APPLICATION ||--o{  INTERVIEW          : "has"
    PROVIDER_APPLICATION ||--o{  PRACTICAL_EXAM     : "has"
    ADMIN             ||--o{  PROVIDER_APPLICATION  : "reviews"
    ADMIN             ||--o{  PROVIDER_DOCUMENT     : "reviews"
    ADMIN             ||--o{  INTERVIEW             : "reviews"
    ADMIN             ||--o{  PRACTICAL_EXAM        : "reviews"
```

---

## Relationship Summary

| Relationship | Cardinality | Foreign Key | Purpose |
|---|---|---|---|
| USER → PROVIDER_PROFILE | 1 : 1 | `PROVIDER_PROFILE.userId → USER._id` | Links a user account to its provider professional profile |
| PROVIDER_PROFILE → PROVIDER_APPLICATION | 1 : N | `PROVIDER_APPLICATION.providerId → PROVIDER_PROFILE._id` | A provider can submit multiple verification applications over time |
| PROVIDER_PROFILE → PROVIDER_DOCUMENT | 1 : N | `PROVIDER_DOCUMENT.providerId → PROVIDER_PROFILE._id` | A provider owns all documents they have ever submitted |
| PROVIDER_APPLICATION → PROVIDER_DOCUMENT | 1 : N | `PROVIDER_DOCUMENT.applicationId → PROVIDER_APPLICATION._id` | Each document is attached to a specific application |
| PROVIDER_APPLICATION → INTERVIEW | 1 : N | `INTERVIEW.applicationId → PROVIDER_APPLICATION._id` | An application may generate multiple interview records |
| PROVIDER_APPLICATION → PRACTICAL_EXAM | 1 : N | `PRACTICAL_EXAM.applicationId → PROVIDER_APPLICATION._id` | An application may generate multiple practical exam records |
| ADMIN → PROVIDER_APPLICATION | 1 : N | `PROVIDER_APPLICATION.reviewedBy → ADMIN._id` | Tracks which admin reviewed an application |
| ADMIN → PROVIDER_DOCUMENT | 1 : N | `PROVIDER_DOCUMENT.reviewedBy → ADMIN._id` | Tracks which admin reviewed a specific document |
| ADMIN → INTERVIEW | 1 : N | `INTERVIEW.reviewedBy → ADMIN._id` | Tracks which admin managed the interview |
| ADMIN → PRACTICAL_EXAM | 1 : N | `PRACTICAL_EXAM.reviewedBy → ADMIN._id` | Tracks which admin managed the practical exam |
