---
id: adr-static-pages-supabase-leaderboard
title: Use static GitHub Pages with a constrained Supabase leaderboard RPC
status: accepted
related_specs:
  - feature-games-hub-leaderboard
---

# ADR: Static GitHub Pages with Supabase

## Context

GitHub Pages cannot persist runtime writes. A shared leaderboard therefore needs an external data service, while the portal should stay inexpensive and simple to operate.

## Decision

Serve build-free HTML, CSS, and JavaScript from the organization Pages repository. Store results in Supabase Postgres. Browser clients use only the publishable key. Public reads use a read-only policy; writes go through a `submit_result` security-definer function that validates the game metric, serializes submissions per game, inserts the result, and removes rows below the best ten. Game metadata defines whether higher scores or shorter times rank first.

The game catalog remains a versioned local JavaScript module. Supabase configuration is a separate public configuration file so the portal works before credentials are supplied.

## Consequences

- Deployment has no package build dependency and existing games remain independent.
- A Supabase project and one SQL migration must be created outside GitHub.
- Public clients can fabricate scores; this MVP prevents malformed storage but does not prove gameplay authenticity.
- A future Edge Function or authenticated score ticket can replace the public RPC without redesigning the portal UI.
