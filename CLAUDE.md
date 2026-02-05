# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start dev server on port 3210 (uses Turbo)
- `npm run build` - Production build
- `npm run preview` - Build and run production

### Code Quality
- `npm run check` - Run lint + TypeScript check (use before committing)
- `npm run lint:fix` - ESLint with auto-fix
- `npm run format:write` - Auto-format with Prettier
- `npm run typecheck` - TypeScript type checking only

### Database
- `npm run db:generate` - Generate Prisma client and run migrations
- `npm run db:migrate` - Deploy pending migrations (production)
- `npm run db:seed` - Seed database

### Code Generation
- `npm run generate` - Generate Prisma client + GraphQL types (run after schema changes)

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Apollo Client, React Hook Form
- **Backend**: Apollo Server 5 (GraphQL), Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: LangChain with LangGraph (OpenAI GPT-4o-mini, Gemini 1.5-flash fallback)
- **Storage**: AWS S3 with presigned URLs

### GraphQL Module Structure
Each feature in `src/graphql/` follows this pattern:
```
feature/
├── feature.schema.ts      # GraphQL type definitions
├── feature.resolvers.ts   # Query/Mutation handlers
├── feature.validators.ts  # Zod validation schemas
├── feature.services.ts    # Business logic (optional)
├── feature.auth.ts        # Permission checks (optional)
└── feature.errors.ts      # Domain errors (optional)
```

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/graphql/` - GraphQL schema, resolvers, and context (modular by feature)
- `src/features/` - Feature-based UI modules (hooks, components)
- `src/server/` - Server utilities: database, AI agents, repositories, dataloaders
- `src/components/ui/` - Reusable UI components (forms, modal, toast)
- `src/lib/` - Shared utilities (auth, validation, S3, error handling)
- `src/config/` - Environment validation (t3-env) and route paths

### Data Flow
1. GraphQL endpoint at `/api/graphql`
2. Resolvers validate input with Zod schemas
3. Services handle business logic
4. Repositories abstract database access (`src/server/repositories/`)
5. Prisma client in `src/server/database/`

### AI Chat Architecture
- LangGraph StateGraph agent in `src/server/ai/chat-agent.ts`
- LLM factory supports OpenAI/Gemini in `src/server/ai/llm.ts`
- Streaming endpoint at `/api/ai/chat/stream`
- Thread/message persistence in `ai_threads` and `ai_messages` tables

### AI Tools & Repository Pattern
- AI tools are in `src/server/ai/tools/`
- Tools should use repositories directly (e.g., `ingredientRepository`)
- **Ingredient repository** (`src/server/repositories/ingredient.repository.ts`):
  - `create()` and `update()` automatically generate vector embeddings for the name
  - `findSimilarByName()` searches ingredients using vector similarity (pgvector)
  - All ingredients are searchable - embeddings are always in sync
- **When adding new fields to entities**:
  1. Update Prisma schema and run `npm run db:generate`
  2. Update GraphQL schema and validators in `src/graphql/<feature>/`
  3. Update repository methods if needed
  4. Update AI tool schemas in `src/server/ai/tools/` to match
- Tool schemas should mirror the Zod validators but add `.describe()` for AI context

## Conventions

### Database
- Snake_case in Prisma schema (mapped to PostgreSQL), camelCase in TypeScript
- All entities have `createdAt`, `updatedAt`, soft delete via `deletedAt`
- Multi-tenant: queries always filter by `userId`

### TypeScript
- Path alias: `~/` maps to `./src/`
- Strict mode enabled
- Unused variables prefixed with `_` are allowed

### Code Style
- Prettier: double quotes, semicolons, trailing commas, 80 char width
- ESLint: TypeScript recommended + Next.js core-web-vitals

### User Roles
- Role-based access control in GraphQL resolvers