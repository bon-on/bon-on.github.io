export const MAX_NAME_LENGTH = 20;
export const MAX_SCORE = 2147483647;

export function normalizeScoreInput(name, score) {
  const normalizedName = String(name ?? '').trim().replace(/\s+/g, ' ');
  const normalizedScore = Number(score);

  if (!normalizedName || normalizedName.length > MAX_NAME_LENGTH) {
    throw new Error(`이름은 1~${MAX_NAME_LENGTH}자로 입력해 주세요.`);
  }
  if (!Number.isInteger(normalizedScore) || normalizedScore < 0 || normalizedScore > MAX_SCORE) {
    throw new Error('점수는 0 이상의 정수로 입력해 주세요.');
  }

  return { name: normalizedName, score: normalizedScore };
}

export function sortAndLimitScores(scores, limit = 10) {
  return [...scores]
    .sort((a, b) => b.score - a.score || new Date(a.played_at) - new Date(b.played_at))
    .slice(0, limit);
}

export function formatPlayedDate(value, locale = 'ko-KR') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
