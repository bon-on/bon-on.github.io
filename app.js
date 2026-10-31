import { games } from './games.js';
import { formatPlayedDate } from './core.js';
import { createLeaderboardClient } from './leaderboard.js';

const client = createLeaderboardClient(window.BON_ON_CONFIG);
const gameGrid = document.querySelector('#game-grid');
const dialog = document.querySelector('#ranking-dialog');
const tabs = document.querySelector('#ranking-tabs');
const list = document.querySelector('#ranking-list');
const state = document.querySelector('#ranking-state');
const title = document.querySelector('#ranking-title');
// Games without a metric have no shared leaderboard.
const rankedGames = games.filter((game) => game.metric);
let selectedGame = rankedGames[0];

for (const game of games) {
  const article = document.createElement('article');
  article.className = 'game-card';
  article.style.setProperty('--accent', game.accent);
  article.innerHTML = `
    <div class="card-art" aria-hidden="true"><span>${game.icon}</span></div>
    <div class="card-body">
      <p class="card-genre">${game.genre}</p>
      <h3>${game.title}</h3>
      <p>${game.description}</p>
      <div class="card-actions">
        <a class="play-button" href="${game.url}">플레이 <span aria-hidden="true">↗</span></a>
        ${game.metric ? `<button class="rank-button" type="button" data-ranking="${game.id}">순위</button>` : ''}
      </div>
    </div>`;
  gameGrid.append(article);
}

for (const game of rankedGames) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.game = game.id;
  button.textContent = game.title;
  button.addEventListener('click', () => selectGame(game));
  tabs.append(button);
}

async function selectGame(game) {
  selectedGame = game;
  title.textContent = `${game.title} 랭킹`;
  tabs.querySelectorAll('button').forEach((button) => {
    button.setAttribute('aria-current', String(button.dataset.game === game.id));
  });
  await loadScores();
}

async function loadScores() {
  list.replaceChildren();
  state.hidden = false;
  state.textContent = client.configured ? '순위를 불러오는 중…' : '랭킹 서비스를 준비하고 있어요. 게임은 지금 바로 플레이할 수 있습니다.';
  if (!client.configured) return;

  try {
    const scores = await client.list(selectedGame.id, selectedGame.metric);
    state.hidden = scores.length > 0;
    state.textContent = scores.length ? '' : '첫 번째 기록의 주인공이 되어보세요.';
    scores.forEach((score, index) => {
      const item = document.createElement('li');
      item.innerHTML = `
        <span class="rank-number">${index + 1}</span>
        <span class="rank-player"><strong></strong><small>${formatPlayedDate(score.played_at)}</small></span>
        <span class="rank-score">${formatResult(score.score, selectedGame.metric)}</span>`;
      item.querySelector('strong').textContent = score.player_name;
      list.append(item);
    });
  } catch (error) {
    state.hidden = false;
    state.textContent = error.message;
  }
}

async function openRanking(game = rankedGames[0]) {
  if (!dialog.open) dialog.showModal();
  await selectGame(game);
}

gameGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-ranking]');
  if (!button) return;
  openRanking(rankedGames.find((game) => game.id === button.dataset.ranking));
});

document.querySelector('#open-global-ranking').addEventListener('click', () => openRanking());
document.querySelector('#close-ranking').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

function formatResult(value, metric) {
  const number = Number(value);
  if (metric !== 'time') return number.toLocaleString();
  return `${Math.floor(number / 60)}:${String(number % 60).padStart(2, '0')}`;
}
