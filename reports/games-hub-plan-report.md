Harness Plan: Bon-on game hub and shared top-ten leaderboards
Spec: /private/tmp/bon-on-games-hub.VWYCN8/bon-on.github.io/harness/specs/feature-games-hub-leaderboard.md
Status: active

Execution order:
1. Read spec intent and acceptance criteria from /private/tmp/bon-on-games-hub.VWYCN8/bon-on.github.io/harness/specs/feature-games-hub-leaderboard.md.
2. Read ADR adr-static-pages-supabase-leaderboard before design or implementation decisions.
3. Read contract contract-games-hub-leaderboard to lock the chunk-level done criteria.
4. Reconcile spec requirements with repo constraints and golden rules.
5. Implement the smallest change that satisfies acceptance criteria.
6. Collect required evidence and record any escalation points.

Acceptance criteria:
- The root page displays all five maintained games and each card opens the correct GitHub Pages URL.
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

Constraints:
- Deploy checked-in static assets without a required frontend build step.
- Ship only the Supabase publishable key; never expose privileged credentials.
- Preserve game availability when the leaderboard backend is missing or unavailable.
- Keep at most ten database rows per game after each serialized submission.
- Version entry-point assets together so a cached script cannot break a newly deployed HTML shell.

Related ADRs:
- adr-static-pages-supabase-leaderboard (accepted): Use static GitHub Pages with a constrained Supabase leaderboard RPC

Related contracts:
- contract-games-hub-leaderboard (active): Deliver the Bon-on game hub and leaderboard

Required evidence:
- node-tests
- harness-audit
- harness-plan
- pages-deployment
- `npm test`
- `reports/games-hub-audit-report.md`
- `reports/games-hub-plan-report.md`
- GitHub Actions Pages deployment result

Blockers:
- none