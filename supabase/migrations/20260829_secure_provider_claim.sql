-- Securely claim a provider listing after the provider confirms/signs in.
-- The listing is initially created anonymously with user_id NULL.
-- This function runs as the function owner, but only allows an authenticated
-- user to claim a row whose email matches the authenticated account email.

create or replace function public.claim_provider_listing()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_id bigint;
  account_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  account_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if account_email = '' then
    raise exception 'Authenticated account has no email';
  end if;

  update public."Providers"
  set user_id = auth.uid()
  where user_id is null
    and lower(email) = account_email
  returning id into claimed_id;

  return claimed_id;
end;
$$;

revoke all on function public.claim_provider_listing() from public;
grant execute on function public.claim_provider_listing() to authenticated;

-- Keep anonymous listing creation working while preventing callers from
-- inserting a row already assigned to a user account.
drop policy if exists "Enable insert for all users" on public."Providers";
create policy "Enable insert for all users"
on public."Providers"
for insert
to public
with check (user_id is null);
