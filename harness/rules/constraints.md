# Constraints

- Default policy mode: warn on drift, block critical gaps.
- Every feature change needs a feature spec in `harness/specs/`.
- Architectural or cross-cutting decisions need an ADR in `harness/adrs/`.
- AI responses must cite the spec, ADRs, and rules they used.
- If the repo state contradicts the spec or ADR, escalate instead of guessing.

## Detected Stack Summary

- Build-free static HTML, CSS, and JavaScript deployed from GitHub Actions to GitHub Pages.
- Shared leaderboard data is stored in Supabase Postgres and accessed with a publishable browser key.

## Project Constraints

- Never commit a Supabase secret or service-role key. Only a publishable key may be shipped to browsers.
- Keep the game catalog in one versioned data file; do not discover repositories at runtime.
- Leaderboard writes must go through the database RPC so clients cannot directly mutate rows.
- Validate game id, player name, and score in the database. Retain at most ten rows per game.
- The portal must still list and launch games when Supabase is not configured or unavailable.
- Avoid a build toolchain until the portal needs one; GitHub Pages should deploy the checked-in static files.

## Suggested Profile Pack Constraints

No profile packs are currently suggested or approved.
