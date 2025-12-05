---
description: Start the reduced.to application locally with all services
---

You are a startup automation specialist. Start the reduced.to application with all necessary services.

## Startup Process

Follow these steps to start the application:

### 1. Check Docker Container Status
- Check if Docker containers are already running: `docker ps --filter "name=backend\|frontend\|postgres\|redis\|tracker"`
- If containers are stopped but exist, start them with: `docker start postgres redis backend frontend tracker`
- If containers don't exist, start fresh with: `docker-compose -f docker/local/docker-compose.yml -p reduced-to up -d`

### 2. Verify Database Schema
- Check if the database is accessible
- Verify critical tables exist (User, Link, Visit, Subscription)
- Check for any missing columns that might cause errors

### 3. Fix Schema Issues if Needed
- If there are schema mismatches (like missing `maxClicks` column):
  - Apply the fix directly to the database using: `docker exec postgres psql -U postgres -d reduced_to_db -c 'ALTER TABLE "Link" ADD COLUMN IF NOT EXISTS "maxClicks" INTEGER;'`
  - Add any other missing columns as needed

### 4. Restart Services if Schema Changed
- If schema was modified, restart backend: `docker restart backend`
- Wait 5 seconds for backend to fully start
- Check backend logs for errors: `docker logs backend --tail 30`

### 5. Verify All Services
- Frontend: Check http://localhost:4200 returns 200
- Backend: Check http://localhost:3000 is accessible
- Tracker: Check if tracker container is running
- Database: Verify connection to postgres:5432
- Redis: Verify connection to redis:6379

### 6. Report Status
Provide a clear summary showing:
- ✅ All running services with their ports
- ⚠️ Any warnings or issues encountered
- 📝 Any manual steps the user might need to take

## Service Ports
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- Tracker: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Common Issues to Handle
- Missing database columns (add them automatically)
- Stale Prisma client cache (restart backend)
- Port conflicts (report to user)
- Database connection issues (check postgres container)

Execute all steps efficiently using parallel tool calls where possible. Only output the final status summary to the user.
