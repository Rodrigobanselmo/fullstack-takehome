# Fullstack Takehome Project

Welcome! This is a fullstack takehome project built with Next.js, Prisma, and a modern component-based architecture. The project is structured for clarity, scalability, and ease of development.

### Context
This implementation follows the [Full-Stack Engineer Take-Home Challenge](https://handoffai.notion.site/Take-Home-Challenge-Full-Stack-Engineer-191fc39a5fa781abadf6d0bdcf071a26#1e0fc39a5fa780388f28f1a0e5c6320a) requirements and is built upon the [fullstack-takehome starter project](https://github.com/1build/fullstack-takehome).

- [x] React frontend
- [x] Node or Python backend
- [x] GraphQL or REST
- [x] Relational database persistence

## Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Database](#database)
- [Contributing](#contributing)
- [Notes](#notes)

---

## Installation

1. **Clone your fork of this repository:**
   ```bash
   git clone https://github.com/Rodrigobanselmo/fullstack-takehome
   cd fullstack-takehome
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the Application

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

**Test Users:**
The SQLite database comes seeded with test users for testing purposes:
- Username: `guest.contractor`  Password: `guest`
- Username: `guest.homeowner`   Password: `guest`

---

## Project Structure

```
fullstack-takehome/
├── prisma/                # Prisma ORM schema, migrations, and seed data
├── public/                # Static assets (e.g., favicon)
├── src/
│   ├── app/               # Next.js app directory (routing, pages, layouts)
│   │   ├── api/           # API routes (GraphQL endpoint)
│   │   ├── dashboard/     # Dashboard pages for different user roles
│   │   ├── login/         # Login page and layout
│   │   ├── components/    # Reusable UI components and layouts
│   │   ├── config/         # App configuration (env, paths)
│   │   ├── context/       # React context providers (e.g., user context)
│   │   ├── features/      # Feature-based modules (auth, chat, jobs)
│   │   │   ├── auth/      # Authentication logic and UI
│   │   │   ├── chat/      # Chat functionality (API, components, hooks)
│   │   │   ├── jobs/      # Job management (API, components, hooks)
│   │   ├── graphql/       # GraphQL schemas, resolvers, services, and types
│   │   ├── lib/           # Utility libraries (auth, validation, etc.)
│   │   ├── providers/     # App-wide providers (e.g., Apollo)
│   │   ├── server/        # Server-side utilities (e.g., database, password hashing)
│   │   ├── styles/        # Global styles
│   ├── codegen.ts         # GraphQL code generation config
│   ├── package.json       # Project dependencies and scripts
│   ├── README.md          # Project documentation (this file)
│   └── ...                # Other config files (eslint, prettier, etc.)
```

### Key Folders

- **prisma/**: Database schema, migrations, and seed scripts.
- **src/app/**: Next.js routing, layouts, and pages.
- **src/components/**: Shared UI components and layout wrappers.
- **src/features/**: Feature-based separation (auth, chat, jobs).
- **src/graphql/**: GraphQL API logic (schemas, resolvers, services).
- **src/lib/**: Utility functions and helpers.
- **src/server/**: Server-side utilities (e.g., Prisma client).
- **src/styles/**: CSS modules and global styles.

---

## Technologies Used

- **Next.js**: React framework for SSR and routing.
- **Prisma**: Type-safe ORM for database access.
- **GraphQL**: API layer for flexible data fetching.
- **React Context**: State management.
- **CSS Modules**: Scoped styling for components.
- **TypeScript**: Type safety across the codebase.

---

## Database

- Uses **SQLite** (file: `prisma/dev.db`) for local development.
- To modify the schema:
  1. Edit `prisma/schema.prisma`
  2. Run migrations: `npx prisma migrate dev`
- To generate the Prisma client after changes: `npx prisma generate`
- To reset the database: `npx prisma reset`
- **Seeding the database:**  
  You can populate your database with initial data using the seed script defined in `package.json`.  
  Run:
  ```bash
  npm run db:seed
  ```
  This will execute the seed script located at `prisma/seed.ts`.


---

## Notes

- Environment variables are managed in `src/config/env.ts`.
- GraphQL endpoint is available at `/api/graphql`.
- For any questions, please refer to the code comments or reach out to the maintainer.

---

