import { normalizeScoreInput, sortAndLimitScores } from './core.js';

function createHeaders(key, includeBody = false) {
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  if (includeBody) headers['Content-Type'] = 'application/json';
  return headers;
}

export function createLeaderboardClient(config, fetchImpl = fetch) {
  const baseUrl = String(config?.supabaseUrl ?? '').replace(/\/$/, '');
  const key = String(config?.supabasePublishableKey ?? '');
  const configured = baseUrl.startsWith('https://') && key.length > 0;

  async function request(path, options = {}) {
    if (!configured) throw new Error('랭킹 서비스가 아직 준비되지 않았어요.');
    const response = await fetchImpl(`${baseUrl}/rest/v1/${path}`, options);
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || '랭킹 서버에 연결하지 못했어요.');
    }
    if (response.status === 204) return null;
    return response.json();
  }

  return {
    configured,
    async list(gameId, metric = 'score') {
      const query = new URLSearchParams({
        select: 'id,game_id,player_name,score,played_at',
        game_id: `eq.${gameId}`,
        order: metric === 'time' ? 'score.asc,played_at.asc' : 'score.desc,played_at.asc',
        limit: '10',
      });
      const rows = await request(`scores?${query}`, { headers: createHeaders(key) });
      return metric === 'time' ? rows.slice(0, 10) : sortAndLimitScores(rows);
    },
    async submit(gameId, name, score, metric = 'score') {
      const value = normalizeScoreInput(name, score);
      await request('rpc/submit_result', {
        method: 'POST',
        headers: createHeaders(key, true),
        body: JSON.stringify({ p_game_id: gameId, p_player_name: value.name, p_value: value.score, p_metric: metric }),
      });
      return value;
    },
  };
}
