alter table public.work_posts
  alter column user_id drop not null;

drop policy if exists "Public can read active work posts" on public.work_posts;
create policy "Public can read active work posts"
on public.work_posts
for select
to public
using (status = 'active' or auth.uid() = user_id);

drop policy if exists "Authenticated users can create own work posts" on public.work_posts;
create policy "Authenticated users can create own work posts"
on public.work_posts
for insert
to authenticated
with check (auth.uid() = user_id);

grant select, insert, update, delete on table public.work_posts to service_role;
grant usage, select on sequence public.work_posts_id_seq to service_role;
