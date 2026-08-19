delete from public.scores where game_id = 'swipe-stack';

alter table public.scores
  drop constraint if exists scores_game_id_check;

alter table public.scores
  add constraint scores_game_id_check check (game_id in (
    'merge-camp',
    'pulse-drift',
    'one-line-labyrinth',
    'tiny-mines',
    'slide-merge'
  ));

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
    'merge-camp', 'pulse-drift', 'one-line-labyrinth',
    'tiny-mines', 'slide-merge'
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
