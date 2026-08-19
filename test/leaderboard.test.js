import test from 'node:test';
import assert from 'node:assert/strict';
import { createLeaderboardClient } from '../leaderboard.js';

const config = { supabaseUrl: 'https://example.supabase.co', supabasePublishableKey: 'public-key' };

test('list requests only a game top ten', async () => {
  let requestedUrl = '';
  const client = createLeaderboardClient(config, async (url) => {
    requestedUrl = url;
    return new Response(JSON.stringify([]), { status: 200 });
  });
  await client.list('merge-camp');
  assert.match(requestedUrl, /game_id=eq\.merge-camp/);
  assert.match(requestedUrl, /limit=10/);
});

test('submit uses the constrained RPC and publishable key', async () => {
  let request;
  const client = createLeaderboardClient(config, async (url, options) => {
    request = { url, options };
    return new Response('null', { status: 200 });
  });
  await client.submit('tiny-mines', 'Miner', 321);
  assert.match(request.url, /rpc\/submit_score$/);
  assert.equal(request.options.headers.apikey, 'public-key');
  assert.deepEqual(JSON.parse(request.options.body), {
    p_game_id: 'tiny-mines', p_player_name: 'Miner', p_score: 321,
  });
});
