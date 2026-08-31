grant select on table public.work_posts to anon, authenticated;
grant insert, update, delete on table public.work_posts to authenticated;
grant usage, select on sequence public.work_posts_id_seq to authenticated;
