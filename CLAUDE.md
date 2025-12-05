# CLAUDE.md

## Project Overview

Reduced.to is a modern URL shortener application built with NestJS (backend), Qwik (frontend), and organized as an Nx monorepo. The application provides link shortening, analytics tracking, QR code generation, and subscription-based features.

## Monorepo Structure

This is an **Nx monorepo** with the following workspace layout:

```
.
├── apps/
│   ├── backend/      # NestJS API server (port 3000)
│   ├── frontend/     # Qwik SSR application (port 4200 dev, 5000 prod)
│   ├── tracker/      # Analytics tracking service (port 3001)
│   └── docs/         # Documentation site
└── libs/
    ├── config/       # Shared configuration service
    ├── logger/       # Logging abstraction
    ├── prisma/       # Database schema and client
    ├── queue-manager/         # Kafka queue integration
    ├── safe-url/              # Google Safe Browsing API
    ├── subscription-manager/  # Subscription/plan management
    └── utils/                 # Shared utilities
```

## Development Commands

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL database:**
   ```bash
   docker run --name reduced_to_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=reduced_to_db -p 5432:5432 -d postgres
   ```

3. **Setup environment:**
   - Copy `.env` or configure environment variables
   - Key variables: `DATABASE_URL`, `BACKEND_APP_PORT`, `FRONTEND_APP_PORT`

4. **Run Prisma migrations:**
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reduced_to_db?schema=public" npx nx migrate-deploy prisma
   ```
   Or for development:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reduced_to_db?schema=public" npx prisma migrate dev --schema=libs/prisma/src/schema.prisma --name=<migration-name>
   ```

### Running Applications

**Backend (NestJS):**
```bash
npx nx serve backend
```
Runs on port 3000 (default). The backend automatically depends on Prisma type generation.

**Frontend (Qwik):**
```bash
npx nx serve frontend
```
Runs on port 4200 in development mode with SSR.

**Tracker (Analytics Service):**
```bash
npx nx serve tracker
```
Runs on port 3001.

**Docker Compose (Full Stack):**
```bash
docker-compose -f docker/local/docker-compose.yml -p reduced-to up
```
Starts PostgreSQL, Redis, backend, frontend, and tracker services together.

### Database Operations

**Generate Prisma Client:**
```bash
npx nx generate-types prisma
```

**Create Migration:**
```bash
npx nx migrate-dev prisma --name=<migration-name>
```

**Apply Migrations:**
```bash
npx nx migrate-deploy prisma
```

**Open Prisma Studio:**
```bash
npx nx studio prisma
```

### Testing

**Run tests for specific app:**
```bash
npx nx test backend
npx nx test frontend
```

**Run all tests:**
```bash
npx nx run-many -t test
```

### Building

**Build specific app:**
```bash
npx nx build backend
npx nx build frontend
```

**Build all apps:**
```bash
npx nx run-many -t build
```

**Build Docker images:**
```bash
npx nx run-many -t docker-build
```

### Linting

**Lint specific app:**
```bash
npx nx lint backend
npx nx lint frontend
```

## Architecture Overview

### Backend (NestJS)

The backend follows a modular NestJS architecture with the following key modules:

- **AuthModule**: JWT-based authentication with Google OAuth2 support
  - Uses Passport strategies (JWT, Local, Google)
  - Cookie-based refresh tokens
  - Email verification via Novu

- **ShortenerModule**: Core URL shortening functionality
  - Generates unique keys for shortened URLs
  - Validates URLs with Google Safe Browsing (optional)
  - Tracks clicks and analytics
  - Supports password-protected links and expiration times

- **LinksModule** (`core/links/`): CRUD operations for links
  - Link creation, update, deletion
  - QR code generation
  - UTM parameter tracking

- **AnalyticsModule**: Visit tracking and statistics
  - IP hashing for privacy
  - GeoIP location tracking
  - User agent parsing (browser, OS, device)

- **BillingModule**: Paddle payment integration
  - Webhook handling for subscription events
  - Plan management (FREE, PRO, BUSINESS)

- **TasksModule**: Scheduled tasks using `@nestjs/schedule`
  - Link expiration cleanup
  - Usage limit resets

- **MetadataModule**: Fetches website metadata (title, favicon)

- **AppCacheModule**: Redis/in-memory caching
  - Configurable via `REDIS_ENABLE` environment variable

### Key Backend Patterns

- **Global throttling** via `CustomThrottlerGuard` (rate limiting)
- **Dependency injection** via NestJS modules
- **Database access** through `PrismaService` (shared lib)
- **Configuration** via `@reduced.to/config` lib (type-safe config service)
- **Logging** via `@reduced.to/logger` lib (custom logger abstraction)

### Frontend (Qwik)

The frontend is a **Qwik City SSR application** with the following structure:

- **Routes** (`apps/frontend/src/routes/`):
  - `/` - Homepage with link shortening form
  - `/dashboard/` - User dashboard with link management
  - `/login` - Authentication
  - `/register` - User registration
  - `/[...key]` - Redirect handler for shortened links
  - `/features`, `/pricing`, `/privacy-policy`, `/terms` - Static pages

- **Styling**: Tailwind CSS + DaisyUI
- **SSR Adapter**: Express.js (`entry.express.tsx`)
- **Build**: Vite-based build system

### Key Frontend Patterns

- **component$()**: Qwik's lazy-loaded component syntax
- **useSignal/useStore**: Qwik's reactivity primitives
- **routeLoader$()**: Server-side data loading
- **routeAction$()**: Form actions and mutations
- **Cookie-based auth**: JWT tokens stored in httpOnly cookies

### Database Schema (Prisma)

The schema (`libs/prisma/src/schema.prisma`) includes:

- **User**: Authentication, roles (USER/ADMIN), email verification
- **AuthProvider**: OAuth providers (EMAIL, GOOGLE)
- **Subscription**: Paddle subscription management
- **Usage**: Per-user link and click limits
- **Link**: Shortened URLs with metadata
- **Visit**: Analytics data (hashed IP, geolocation, user agent)
- **Report**: User-reported malicious links

Key relationships:
- User → Links (one-to-many)
- User → Subscription (one-to-one)
- User → Usage (one-to-one)
- Link → Visits (one-to-many)

## Important Configuration Notes

### Environment Variables

- **Database**: Update `DATABASE_URL` host to `postgres` when running via Docker Compose
- **API Domain**: Set `API_DOMAIN=http://backend:3000` for Docker Compose
- **Ports**: Backend (3000), Frontend (5000), Tracker (3001)
- **Optional Services**: REDIS, KAFKA, SAFE_URL, STORAGE, PADDLE, NOVU (all configurable via `*_ENABLE` flags)

### Docker Deployment

- Docker images are built from workspace root context
- Dockerfiles are in each app directory (`apps/*/Dockerfile`)
- Use `docker/local/docker-compose.yml` for local full-stack deployment
- Kubernetes deployment via Helm chart in `docker/k8s/chart/`

### Prisma Client Location

The Prisma client is generated to `node_modules/.prisma/client` (shared across workspace). This is critical for Nx monorepo structure.

## Development Workflow

1. **Make schema changes**: Edit `libs/prisma/src/schema.prisma`
2. **Create migration**: Run `npx nx migrate-dev prisma --name=<name>`
3. **Backend changes**: Edit files in `apps/backend/src/`, tests run automatically
4. **Frontend changes**: Edit files in `apps/frontend/src/`, Qwik supports HMR
5. **Test locally**: Use `npx nx serve backend` + `npx nx serve frontend`
6. **Test with Docker**: Use `docker-compose up` to test full stack

## Testing Strategy

- **Backend**: Jest unit tests in `*.spec.ts` files alongside source
- **Integration tests**: Test with real database (use `DATABASE_URL` for test DB)
- **Frontend**: Use playwright-skill
- **E2E**: Not yet implemented (roadmap item)

## Common Gotchas

1. **Prisma generation**: Always run `npx nx generate-types prisma` after schema changes
2. **Backend serve**: Automatically depends on Prisma type generation (see `project.json`)
3. **Docker networking**: Use service names (e.g., `postgres`, `backend`) not `localhost` in Docker Compose
4. **Frontend API calls**: Use `API_DOMAIN` for server-side, `CLIENTSIDE_API_DOMAIN` for client-side
5. **Port conflicts**: Ensure ports 3000, 4200/5000, 5432 are available
6. **Database migrations**: Always use `DATABASE_URL` environment variable with full connection string

## API Versioning

The backend uses URI versioning with `/api/v1/` prefix (configured in `main.ts`). Default version is `v1`.

## Subscription Plans

Three tiers defined in Prisma schema:
- **FREE**: 5 links, 250 clicks
- **PRO**: Higher limits
- **BUSINESS**: Highest limits

To manually change plan locally: Insert row in `Subscription` table with desired plan, then relogin to refresh JWT.

---

### Skills

**IMPORTANT: ALWAYS CHECK TO SEE IF ANY SKILLS ARE RELEVANT TO THE PROMPT. IF SO, LET THE USER KNOW WHEN YOU ARE USING A SKILL**

#### 1. **backend-dev-guidelines**
**Auto-activates when:** Working with NestJS backend, creating routes/controllers/services, database operations, validation, or backend testing.

**Provides guidance on:**
- Layered architecture (routes → controllers → services → repositories)
- BaseController pattern and error handling
- Prisma database access patterns
- Zod validation and DTOs
- Sentry error tracking
- UnifiedConfig usage (never direct process.env)
- Dependency injection and async patterns

**Key principles:**
- Routes only route, controllers control
- All controllers extend BaseController
- All errors go to Sentry
- Use unifiedConfig, never process.env
- Validate all input with Zod

#### 2. **frontend-dev-guidelines**
**Auto-activates when:** Working with Qwik components, routes, forms, or frontend styling.

**Provides guidance on:**
- Qwik component$ patterns and signals/stores
- Qwik City routing with routeLoader$/routeAction$
- Form handling with Form + zod validation
- Tailwind CSS + DaisyUI styling patterns
- Client-side state management
- Performance optimization with Qwik
- TypeScript standards for frontend

**Key principles:**
- Use component$ with typed props
- Manage state with useSignal/useStore
- Keep layout stable with skeletons instead of early returns
- Style with Tailwind + DaisyUI
- SSR data in loaders, mutations in actions

#### 3. **playwright-skill**
**Auto-activates when:** User mentions browser testing, automation, e2e testing, or Playwright.

**Provides:**
- Complete browser automation with Playwright
- Auto-detects dev servers running on localhost
- Writes clean test scripts to /tmp
- Tests pages, fills forms, takes screenshots
- Validates responsive design and UX
- Tests login flows and link generation

**Usage pattern:**
1. Auto-detects running dev servers
2. Writes custom Playwright code to /tmp
3. Executes via universal executor
4. Shows results with visible browser by default

#### 4. **skill-developer**
**Auto-activates when:** Creating new skills, modifying skill-rules.json, working with hooks, or understanding trigger patterns.

**Provides guidance on:**
- Skill structure and YAML frontmatter
- Trigger types (keywords, intent patterns, file paths, content patterns)
- Enforcement levels (block, suggest, warn)
- Hook mechanisms (UserPromptSubmit, PreToolUse)
- Progressive disclosure and the 500-line rule
- Session tracking and skip conditions

### Hooks

Hooks execute automatically at specific points in the workflow to provide reminders or enforce guardrails.

#### 1. **UserPromptSubmit Hook** (skill-activation-prompt.sh)
**Triggers:** BEFORE Claude sees your prompt

**Purpose:** Proactively suggests relevant skills based on keywords and intent patterns in your message.

**How it works:**
- Analyzes your prompt for keywords and patterns
- Injects formatted skill reminders as context
- Suggests relevant skills without blocking workflow

**Example:** If you mention "creating routes" or "NestJS controller", it suggests the backend-dev-guidelines skill.

#### 2. **PostToolUse Hook** (post-tool-use-tracker.sh)
**Triggers:** AFTER Edit/Write tool usage

**Purpose:** Tracks code changes and maintains development history.

**How it works:**
- Monitors Edit and Write tool usage
- Records file modifications and patterns
- Helps maintain awareness of changes across sessions


### Configuration Files

All custom extensions are configured in:
- `.claude/config.json` - Main configuration for agents, skills, and hooks
- `.claude/skills/skill-rules.json` - Skill trigger patterns and rules
- `.claude/agents/*.md` - Agent definitions
- `.claude/skills/*/SKILL.md` - Skill content
- `.claude/commands/*.md` - Command definitions

These extensions are designed to make your development workflow more efficient while maintaining code quality and project consistency.
