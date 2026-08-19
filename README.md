# Bon-on Games

Bon-on의 GitHub Pages 게임을 한곳에서 실행하고 게임별 상위 10개 기록을 확인하는 정적 포털입니다.

## 로컬 실행

```sh
python3 -m http.server 8080
```

`http://localhost:8080`을 열면 게임 목록을 볼 수 있습니다. Supabase 설정 전에도 게임 실행 링크는 정상 동작합니다.

## Supabase 최초 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 무료 프로젝트를 하나 생성합니다.
2. SQL Editor에서 [`supabase/migrations/001_leaderboard.sql`](supabase/migrations/001_leaderboard.sql) 전체를 실행합니다.
3. Project Settings 또는 Connect 화면에서 Project URL과 `sb_publishable_...` 키를 확인합니다.
4. [`config.js`](config.js)의 두 값을 채웁니다.

```js
window.BON_ON_CONFIG = Object.freeze({
  supabaseUrl: 'https://PROJECT.supabase.co',
  supabasePublishableKey: 'sb_publishable_...',
});
```

`secret` 또는 `service_role` 키는 브라우저 코드와 GitHub 저장소에 절대 추가하지 마세요. 공개 키가 노출되어도 쓰기는 검증된 `submit_score` 함수로만 가능하도록 SQL에서 권한을 제한합니다.

## 점수 제출 연동

각 게임은 종료 시 포털의 동일한 Supabase RPC를 호출할 수 있습니다. 요청 형식은 다음과 같습니다.

```http
POST https://PROJECT.supabase.co/rest/v1/rpc/submit_score
apikey: sb_publishable_...
Authorization: Bearer sb_publishable_...
Content-Type: application/json

{
  "p_game_id": "merge-camp",
  "p_player_name": "player",
  "p_score": 1200
}
```

허용된 `game_id`는 `games.js`와 SQL migration에 함께 정의되어 있습니다. 현재 포털에서도 수동으로 이름과 점수를 등록할 수 있습니다.

기존 Supabase 프로젝트에는 migration 파일을 번호 순서대로 실행해야 합니다. `002_remove_swipe_stack.sql`은 SwipeStack 기록과 허용 식별자를 제거합니다.

## 검증 및 배포

```sh
npm test
node /Users/junsik.park/sources/harness-lab/dist/index.js audit . --format md
node /Users/junsik.park/sources/harness-lab/dist/index.js plan harness/specs/feature-games-hub-leaderboard.md --format text
```

`main` 브랜치 push 시 GitHub Actions가 테스트 후 `https://bon-on.github.io/`에 배포합니다.
