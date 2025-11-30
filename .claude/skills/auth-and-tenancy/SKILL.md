# Skill: auth-and-tenancy

## Purpose

Explain how authentication, authorization, and workspace/tenant scoping works in Reduced.to.

Document:
- How users authenticate (JWT, OAuth, etc.)
- How workspaces or teams are represented in the DB
- What roles exist (user, admin, etc.)
- Which IDs must always be present in queries (userId, workspaceId)

## Rules

- Any endpoint that returns user data MUST be scoped by tenant/workspace.
- Admin-only routes must check admin permissions explicitly.
- Avoid leaking cross-tenant data.
