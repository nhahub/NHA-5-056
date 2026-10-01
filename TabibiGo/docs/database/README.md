# TabibiGo — Database Documentation

> **Status:** Blueprint · **Version:** 1.0 · **Last Updated:** 2026-10-01

---

## Project Overview

This documentation defines the official database blueprint for **TabibiGo** — a healthcare service platform that connects patients with verified medical and wellness providers.

The schemas and relationships described here represent the agreed-upon data model that all backend services must implement. This documentation serves as the single source of truth for database design decisions across the project and is intended to be used as a reference during backend implementation.

---

## Current Scope

The current documentation covers the following domain:

| Area | Description |
|------|-------------|
| **Client User Authentication** | User account creation, login, and verification |
| **Provider Profile** | Provider personal and professional information |
| **Provider Application** | The formal verification application submitted by providers |
| **Provider Documents** | Supporting documents submitted as part of an application |
| **Provider Interviews** | Interview scheduling and evaluation records |
| **Provider Practical Exams** | Practical exam scheduling and evaluation records |
| **Admin Review** | Admin-side review and decision traceability |

---

## Systems

TabibiGo is split into two independently deployable systems:

### TabibiGo (Client System)

| Part | Role |
|------|------|
| `client` | React frontend application for patients and providers |
| `client-api` | Node.js/Express REST API serving the client frontend |

### TabibiGo-Admin (Admin System)

| Part | Role |
|------|------|
| `admin` | React frontend application for admin staff |
| `admin-api` | Node.js/Express REST API serving the admin frontend |

### Communication

The two systems are **fully decoupled at the application layer**. They communicate exclusively through **HTTP APIs** — neither system imports code from the other, nor do they share a runtime process.

> **Authentication Separation:** Admin authentication is completely separate from Client authentication. Admin credentials, JWT secrets, and session logic are managed independently by `admin-api` and must never be mixed with Client credentials managed by `client-api`.

---

## Documentation Map

| Document | Description | Path |
|----------|-------------|------|
| **ERD** | Entity Relationship Diagram for Provider Auth & Verification | `provider-auth/ERD.md` |
| **Schema** | Full field-level schema reference for all entities | `provider-auth/SCHEMA.md` |

---

## Database Design Principles

The following principles govern all database decisions in this project:

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Separation of authentication and profile data** | `User` stores credentials; `ProviderProfile` stores professional information. Mixing them creates coupling and security risk. |
| 2 | **Separation of provider profile and provider application** | A provider may submit multiple applications over time. The profile is persistent; the application is a discrete event. |
| 3 | **Independent document verification** | Each `ProviderDocument` is reviewed independently, allowing partial approval and granular audit trails. |
| 4 | **Independent interview records** | Each `Interview` is a standalone record with its own lifecycle and result, allowing rescheduling without data loss. |
| 5 | **Independent practical exam records** | Each `PracticalExam` is a standalone record. Multiple exam attempts per application are supported. |
| 6 | **Admin review traceability** | Every reviewed entity stores `reviewedBy` (Admin ID) and `reviewedAt` (timestamp) to ensure full accountability. |
| 7 | **ID-based relationships** | Entities reference each other through IDs only. No embedded sub-documents are used for cross-entity references. |
| 8 | **No plain-text passwords** | Passwords are never stored in plain text. Only the bcrypt hash (`passwordHash`) is persisted. |
| 9 | **Files stored outside the database** | Uploaded files (documents, photos) are stored in an external file storage service. Only the file reference (`fileUrl`) is stored in the database. |
