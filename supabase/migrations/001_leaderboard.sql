create extension if not exists pgcrypto;

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  game_id text not null check (game_id in (
    'merge-camp',
    'swipe-stack',
    'pulse-drift',
    'one-line-labyrinth',
    'tiny-mines',
    'slide-merge'
  )),
  player_name text not null check (
    char_length(btrim(player_name)) between 1 and 20
    and player_name = btrim(player_name)
  ),
  score integer not null check (score >= 0),
  played_at timestamptz not null default now()
);

create index if not exists scores_game_ranking_idx
  on public.scores (game_id, score desc, played_at asc);

alter table public.scores enable row level security;

drop policy if exists "Public leaderboard read" on public.scores;
create policy "Public leaderboard read"
  on public.scores for select
  to anon
  using (true);

revoke all on public.scores from anon, authenticated;
grant select on public.scores to anon, authenticated;

create or replace function public.submit_score(
  p_game_id text,
  p_player_name text,
  p_score bigint
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  normalized_name text := regexp_replace(btrim(p_player_name), '\s+', ' ', 'g');
begin
  if p_game_id not in (
    'merge-camp', 'swipe-stack', 'pulse-drift',
    'one-line-labyrinth', 'tiny-mines', 'slide-merge'
  ) then
    raise exception 'Unknown game';
  end if;

  if normalized_name is null or char_length(normalized_name) not between 1 and 20 then
    raise exception 'Player name must contain 1 to 20 characters';
  end if;

  if p_score is null or p_score < 0 or p_score > 2147483647 then
    raise exception 'Score must be an integer from 0 to 2147483647';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_game_id));

  insert into public.scores (game_id, player_name, score)
  values (p_game_id, normalized_name, p_score::integer);

  delete from public.scores
  where id in (
    select id
    from public.scores
    where game_id = p_game_id
    order by score desc, played_at asc, id asc
    offset 10
  );
end;
$$;

revoke all on function public.submit_score(text, text, bigint) from public;
grant execute on function public.submit_score(text, text, bigint) to anon, authenticated;
