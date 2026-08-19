import test from 'node:test';
import assert from 'node:assert/strict';
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
