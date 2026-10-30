# 🏥 Tabibi Go | طبيبي جو

### Home Healthcare Services Platform

**Tabibi Go** is a digital healthcare platform that connects patients with qualified healthcare providers, making it easier to access reliable medical services at home.

Our goal is to simplify the process of finding healthcare professionals, discovering available medical services, and booking home healthcare appointments through one integrated platform.

---

## 🎯 Project Overview

Accessing reliable healthcare services can be challenging, especially for patients who have difficulty visiting hospitals or clinics.

Tabibi Go aims to solve this problem by providing a centralized platform where patients can find trusted healthcare providers and request medical services from the comfort of their homes.

The platform serves three main roles:

* **Patients:** Discover medical services, explore providers, and request home healthcare appointments.
* **Healthcare Providers:** Create professional profiles, manage their services, and handle patient requests.
* **Administrators:** Manage platform operations, review provider applications, and maintain service quality.

---

## ✨ Key Features

### 👤 Patient Features

* User registration and authentication.
* Personal profile management.
* Browse available medical services.
* Discover healthcare providers by specialization.
* Request home healthcare services.
* Manage booking requests.

### 🩺 Healthcare Provider Features

* Provider registration and profile management.
* Specialization-based service management.
* Submit services for approval.
* Complete practical assessments when required.
* Manage patient service requests.

### 🛡️ Admin Features

* Dedicated admin dashboard.
* Manage patients and healthcare providers.
* Review and approve provider applications.
* Evaluate provider qualifications and practical assessments.
* Manage medical specialties and services.
* Monitor platform activities.

---

## 🛠️ Technology Stack

| Category          | Technologies         |
| ----------------- | -------------------- |
| Frontend          | React.js             |
| Backend           | Node.js, Express.js  |
| Database          | MongoDB              |
| ODM               | Mongoose             |
| Authentication    | JWT                  |
| API Architecture  | RESTful APIs         |
| Development Tools | Git, GitHub, Postman |

---

## 🏗️ System Architecture

The platform uses a modular architecture with separate backend environments for client operations and administration.

```text
                 Tabibi Go
                     |
          +----------+----------+
          |                     |
     Client Application    Admin Dashboard
          |                     |
     Client API              Admin API
     Port: 5000              Port: 5001
          |                     |
     Client Database       Admin Database
          |                     |
       MongoDB                MongoDB
```

Each backend environment has its own responsibilities, database, and authentication system to support better separation and security.

---

## 🔐 Authentication & Security

* JWT-based authentication.
* Password hashing.
* Role-based access control.
* Protected API endpoints.
* Separate authentication for administrators.
* Provider approval before publishing medical services.

---

## 👥 Team Members – Team 1

| Role        | Name                        |
| ----------- | --------------------------- |
| Team Leader | خالد محمود عبد العزيز هلالي |
| Team Member | ريتاج سامح محمود محمد       |
| Team Member | أحمد إيهاب عبد اللطيف       |
| Team Member | عنان محمد                   |

---

## 🚀 Project Vision

Our vision is to make home healthcare more accessible, organized, and reliable by connecting patients with qualified healthcare professionals through a simple and user-friendly digital experience.

---

## 📌 Project Status

Currently under development as a graduation project.

---

## 🔗 Repository

[GitHub Repository – Tabibi Go](https://github.com/nhahub/NHA-5-056)

---

**Tabibi Go – Healthcare at Your Doorstep.** ❤️
