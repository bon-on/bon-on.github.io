alter table public.scores add column if not exists metric_type text not null default 'score'
  check (metric_type in ('score', 'time'));

create or replace function public.submit_result(
  p_game_id text, p_player_name text, p_value bigint, p_metric text
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare
  normalized_name text := regexp_replace(btrim(p_player_name), '\s+', ' ', 'g');
  expected_metric text := case when p_game_id in ('one-line-labyrinth', 'tiny-mines') then 'time' else 'score' end;
begin
  if p_game_id not in ('merge-camp','pulse-drift','one-line-labyrinth','tiny-mines','slide-merge') then raise exception 'Unknown game'; end if;
  if p_metric is distinct from expected_metric then raise exception 'Invalid metric'; end if;
  if normalized_name is null or char_length(normalized_name) not between 1 and 20 then raise exception 'Invalid player name'; end if;
  if p_value is null or p_value < 0 or p_value > 2147483647 then raise exception 'Invalid result'; end if;
  perform pg_advisory_xact_lock(hashtext(p_game_id));
  insert into public.scores(game_id, player_name, score, metric_type) values(p_game_id, normalized_name, p_value::integer, p_metric);
  delete from public.scores where id in (
    select id from public.scores where game_id = p_game_id
    order by case when expected_metric = 'time' then score end asc,
      case when expected_metric = 'score' then score end desc, played_at asc, id asc offset 10
  );
end $$;

revoke all on function public.submit_result(text,text,bigint,text) from public;
grant execute on function public.submit_result(text,text,bigint,text) to anon, authenticated;
revoke execute on function public.submit_score(text,text,bigint) from anon, authenticated;
