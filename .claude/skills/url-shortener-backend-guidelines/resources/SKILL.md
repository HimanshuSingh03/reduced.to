# Skill: url-shortener-backend-guidelines

## 1. Purpose

You are working in the **Reduced.to** URL shortener backend.

Stack:
- Nx monorepo
- NestJS backend under `apps/backend`
- Prisma ORM & PostgreSQL under `libs/prisma`

Use this skill whenever modifying:
- Link creation / update / deletion
- Redirect behavior
- Analytics / click tracking
- Workspace / user-scoped link queries

## 2. Core Invariants

1. **Slug uniqueness**  
   - Each short link slug must be unique within its namespace (describe your exact rule).
2. **Redirect correctness**  
   - When a slug is valid and active, respond with an HTTP redirect (301/302).  
   - If a link is expired or disabled, respond with the appropriate status (e.g. 410/404).
3. **Analytics safety**  
   - Analytics writes must not break redirects. If analytics fails, redirect still succeeds.
4. **Auth & tenancy**  
   - All queries that return user-owned data MUST be scoped by workspace/user id.

## 3. Implementation Notes

- Describe the controller/service/module structure.
- Note where Prisma client is defined.
- Note how migrations are run (e.g. `npx prisma migrate dev` or Nx target).

## 4. How to use this skill

When asked to change backend link logic:
- First, restate relevant invariants.
- Then propose a short plan.
- Only then modify code, ensuring:
  - DB changes go through migrations.
  - Redirect logic preserves existing behavior unless explicitly changing it.
