# 📅 Reserving System - Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Resend-black?style=for-the-badge&logo=minutemailer&logoColor=white" alt="Resend" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
</p>

---

A robust, scalable REST API built to manage university room reservations, user authentication, and administrative controls. Built with Domain-Driven Design principles in mind.

<div align="center">

## 🛠️ Tech Stack

| Category | Technology Used |
| :--- | :--- |
| **Core Framework** | **NestJS** (Node.js) |
| **Language** | **TypeScript** |
| **Database** | **PostgreSQL** |
| **ORM** | **TypeORM** |
| **Authentication** | **JWT** & bcrypt |
| **Email Service** | **Resend API** |
| **Infrastructure** | **Docker & Docker Compose** |

</div>

<br>

## 🐳 Containerization & Infrastructure

The backend is fully containerized to ensure environment parity and "Zero-Install Development". 

### 🏗️ Services Architecture

<div align="center">

| Service | Image | Port | Persistence | Role |
| :--- | :--- | :--- | :--- | :--- |
| **API Backend** | `node:18-alpine` | `3000` | N/A | NestJS REST API |
| **Database** | `postgres:15` | `5433` | `postgres_data` | Relational Persistence |

</div>

---

## 🚀 How to Run (Local Setup)

### 1. Environment Configuration
Clone the repository and duplicate the `.env.template` file, renaming it to `.env`:
> cp .env.template .env

Fill in the `JWT_SECRET` with a secure string. 

> [!IMPORTANT]
> **Email Configuration:** The password recovery flow uses [Resend](https://resend.com/). You must create a free account, generate an API Key, and place it in your `.env` file under `RESEND_API_KEY`. If left empty, the application will fallback to printing recovery links in the server console.

### 2. Start the Database
Fire up the PostgreSQL instance using Docker:
> docker-compose up -d

### 3. Install & Start the API
Install dependencies and run the development server:
> npm install
> npm run start:dev

The API will be available at `http://localhost:3000`.

### 👑 Super Admin Auto-Seeding
To solve the "chicken and egg" problem of RBAC, the application uses NestJS `OnApplicationBootstrap`. 
When the server starts for the very first time on a fresh database, it will automatically create a default Super Administrator account based on the `.env` variables:
* **Email:** `admin@gmail.com`
* **Password:** `Admin123!` (If not overridden in .env)

*Note: For security reasons, the Super Admin's email address cannot be modified via the UI or API endpoints once created.*

---

## 📂 Folder Layout

The project follows a modular architecture based on "Features" to keep the code scalable, organized, and easy to maintain. All core logic and features are encapsulated within the `src` directory:

```bash
📂 src/
├── 📂 auth/               # Authentication & Authorization Module
│   ├── 📂 decorators/     # Custom decorators (@GetUser, @Roles)
│   ├── 📂 dto/            # Data Transfer Objects (Login, Reset Password)
│   ├── 📂 guards/         # RBAC Guards (RolesGuard)
│   ├── 📂 strategies/     # Passport strategies (JWT)
│   └── 📄 auth.module.ts  # Module definition
│
├── 📂 groups/             # Groups/Subjects management feature
│   ├── 📂 dto/            # Validation schemas
│   ├── 📂 entities/       # TypeORM Group Entity
│   └── 📄 groups.*.ts     # Controller & Service
│
├── 📂 halls/              # Halls management feature
│   ├── 📂 dto/            # Validation schemas
│   ├── 📂 entities/       # TypeORM Hall Entity
│   └── 📄 halls.*.ts      # Controller & Service
│
├── 📂 reservations/       # Core business logic for reservations
│   ├── 📂 decorators/     # Custom class-validator rules (@IsAfter, @IsFuture)
│   ├── 📂 dto/            # Payloads & Query params
│   ├── 📂 entities/       # TypeORM Reservation Entity
│   ├── 📂 enums/          # Status enums (PENDING, APPROVED, REJECTED)
│   └── 📄 reservations.* # Controller & Service
│
├── 📂 users/              # User management feature
│   ├── 📂 dto/            # Validation schemas
│   ├── 📂 entities/       # TypeORM User Entity
│   └── 📄 users.*.ts      # Controller & Service
│
├── 📄 app.module.ts       # Main application module
└── 📄 main.ts             # Application entry point and global config (Pipes, CORS)
```