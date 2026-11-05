---
id: feature-games-hub-leaderboard
title: Bon-on game hub and shared top-ten leaderboards
status: active
owner: bon-on
related_adrs:
  - adr-static-pages-supabase-leaderboard
related_contracts:
  - contract-games-hub-leaderboard
required_evidence:
  - node-tests
  - harness-audit
  - harness-plan
  - pages-deployment
---

# Feature: Bon-on game hub and shared top-ten leaderboards

## Problem

Bon-on games are deployed as separate GitHub Pages projects. Players need one organization home page where they can discover and launch every game, then compare a small shared leaderboard for each title.

## Scope

- Publish a responsive game catalog at `https://bon-on.github.io/`.
- Show the game choices immediately below the site header without landing copy or a catalog heading.
- List MergeCamp, PulseDrift, OneLineLabyrinth, TinyMines, SlideMerge, PourSort, NonoGrid, and SwipeStack.
- PourSort, NonoGrid, and SwipeStack have no shared leaderboard (`metric: null`): their cards show no ranking button and they are absent from the ranking tabs.
- Launch each existing project site without copying its game bundle into the portal.
- Read shared leaderboard rows from Supabase.
- Accept game-produced integer results after an opt-in prompt and retain only the best ten rows per game.
- Rank MergeCamp, PulseDrift, and SlideMerge by highest score; rank OneLineLabyrinth and TinyMines by shortest completion time.
- Show name, date, and result ordered by each game's metric, with older records first on ties.
- Provide database setup and configuration documentation.

## Out of Scope

- Player accounts, prizes, score cryptographic verification, and an admin console.
- Embedding games in iframes or modifying game repositories in this feature.
- Guaranteed prevention of fabricated scores from modified clients.

## Constraints

- Deploy checked-in static assets without a required frontend build step.
- Ship only the Supabase publishable key; never expose privileged credentials.
- Preserve game availability when the leaderboard backend is missing or unavailable.
- Keep at most ten database rows per game after each serialized submission.
- Version entry-point assets together so a cached script cannot break a newly deployed HTML shell.

## Acceptance Criteria

- The root page displays all eight maintained games and each card opens the correct GitHub Pages URL.
- Only games with a ranking metric offer a ranking button and a ranking tab.
- The root page has no marketing hero, promotional slogan, introductory copy, or catalog heading; game choices begin immediately below the header.
- A deployment cache mismatch does not prevent the game cards from rendering.
- Selecting a game displays its top ten shared scores.
- Players cannot type a result in the portal; each game asks after completion whether to register its measured result, then asks only for a name.
- A valid game-produced result immediately appears when it qualifies.
- Invalid game ids, blank/oversized names, negative scores, and non-integer scores are rejected by the database.
- The database contains no more than ten leaderboard rows per game after a submission completes.
- Supabase secret/service-role credentials are absent from the repository and browser bundle.
- Without Supabase configuration, the catalog remains usable and the leaderboard explains how to enable it.
- Automated tests cover catalog validity, ranking order, input normalization, and top-ten retention behavior.

## Verification

- `npm test`
- `node <harness-lab>/dist/index.js audit . --format md`
- `node <harness-lab>/dist/index.js plan harness/specs/feature-games-hub-leaderboard.md --format text`
- Verify the GitHub Pages deployment and public URL after pushing.

## Evidence

- `npm test`
- `reports/games-hub-audit-report.md`
- `reports/games-hub-plan-report.md`
- GitHub Actions Pages deployment result
