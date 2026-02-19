# Room Reservation System API

A robust RESTful API built with **NestJS** and **PostgreSQL** to manage room bookings, user roles, and group affiliations. Designed to streamline the process of reserving common spaces with an approval workflow.

## Tech Stack

* **Framework:** [NestJS](https://nestjs.com/) (Node.js)
* **Language:** TypeScript
* **Database:** PostgreSQL 16
* **ORM:** TypeORM
* **Containerization:** Docker & Docker Compose

## Features (In Progress)

* [ ] **User Management:** Registration, Login, and Role-based Access Control (RBAC).
<br>

* [ ] **Groups:** Manage affiliations (e.g., Departments, Clubs).
<br>

* [ ] **Rooms:** CRUD operations for spaces/rooms.
<br>

* [ ] **Bookings:** Request, approve, or reject room reservations.
<br>

* [ ] **Validation:** Prevention of schedule conflicts.

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or later)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the database)
* [Git](https://git-scm.com/)

### 1. Installation

Clone the repository and install the dependencies:

```bash
# Install dependencies
npm install
```

### 2. Database Setup

This project uses **Docker Compose** to run a local instance of PostgreSQL. You don't need to install PostgreSQL manually on your machine.

1. Ensure Docker Desktop is running:
<br>
2. Start the database container:

```bash
docker compose up -d
```
<br>

3. Check if the container is running

```bash
docker ps
```

*You should see a container named `db` running on port `5433` mapped to internal `5432`.*

### 3. Running the Application

Once the database is up, start the NestJs server in development mode:

```bash
# Watch mode (auto-restart on changes)
npm run start:dev
```

## Enviroment Variables

To run this project, you will need to set up your enviroment variavles.

1. Copy the template file:

```bash
cp .env.template .env
```
(Or manually create `.env` and copy the contents of `.env.template` into it)

2. The default values in `.env.template` are pre-configured to work with the docker setup provided in this repo.