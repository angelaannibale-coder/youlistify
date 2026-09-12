alter table public.work_posts
add column if not exists location_mode text;

alter table public.work_posts
alter column location_mode set default 'local';

update public.work_posts
set location_mode = case
  when remote = true then 'remote'
  else 'local'
end
where location_mode is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'work_posts_location_mode_check'
  ) then
    alter table public.work_posts
    add constraint work_posts_location_mode_check
    check (location_mode in ('local','remote','both'));
  end if;
end $$;
