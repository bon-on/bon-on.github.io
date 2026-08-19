import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { games } from '../games.js';
import { normalizeScoreInput, sortAndLimitScores } from '../core.js';

test('catalog has six unique secure GitHub Pages games', () => {
  assert.equal(games.length, 6);
  assert.equal(new Set(games.map((game) => game.id)).size, games.length);
  for (const game of games) {
    assert.match(game.url, /^https:\/\/bon-on\.github\.io\/[A-Za-z]+\/$/);
  }
});

test('score input is normalized and validated', () => {
  assert.deepEqual(normalizeScoreInput('  캠프   왕  ', '42'), { name: '캠프 왕', score: 42 });
  assert.throws(() => normalizeScoreInput(' ', 10));
  assert.throws(() => normalizeScoreInput('player', -1));
  assert.throws(() => normalizeScoreInput('player', 1.5));
});

test('scores are ordered and limited to ten', () => {
  const rows = Array.from({ length: 12 }, (_, index) => ({
    score: index,
    played_at: new Date(2026, 0, index + 1).toISOString(),
  }));
  const result = sortAndLimitScores(rows);
  assert.equal(result.length, 10);
  assert.deepEqual(result.map((row) => row.score), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
});

test('older record wins a tied score', () => {
  const result = sortAndLimitScores([
    { score: 100, played_at: '2026-02-02T00:00:00Z' },
    { score: 100, played_at: '2026-02-01T00:00:00Z' },
  ]);
  assert.equal(result[0].played_at, '2026-02-01T00:00:00Z');
});

test('landing page leads directly with a concise game selection', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /잠깐의 틈|SIX SMALL WORLDS|class="hero"|Bon-on의 게임을 골라/);
  assert.match(html, /<section class="games-section" id="games" aria-label="게임 선택">\s*<div class="game-grid"/);
  assert.match(html, /app\.js\?v=\d{8}-\d+/);
  assert.match(html, /styles\.css\?v=\d{8}-\d+/);
  assert.ok(html.indexOf('id="games"') < html.indexOf('id="game-grid"'));
});
