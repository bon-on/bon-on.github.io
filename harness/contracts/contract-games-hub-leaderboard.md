---
id: contract-games-hub-leaderboard
title: Deliver the Bon-on game hub and leaderboard
status: active
related_specs:
  - feature-games-hub-leaderboard
evidence_files:
  - reports/games-hub-audit-report.md
  - reports/games-hub-plan-report.md
---

# Contract: Games hub and leaderboard

## Goal

Deliver a public organization home page that launches every Bon-on game and provides a shared Supabase-backed top-ten leaderboard per game.

## Done Criteria

- The static portal, catalog, accessible leaderboard UI, and setup guide are committed.
- The SQL migration implements validated atomic submissions and ten-row retention.
- Tests and harness audit/plan checks pass.
- GitHub Pages deployment is configured and the site responds publicly.

## Verification

- `npm test`
- Harness audit and plan commands from the active feature spec.
- GitHub Actions deployment status and public-site HTTP response.

## Evidence References

- `reports/games-hub-audit-report.md`
- `reports/games-hub-plan-report.md`
