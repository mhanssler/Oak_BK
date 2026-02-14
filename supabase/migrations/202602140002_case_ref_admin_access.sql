alter table public.bankruptcy_cases
add column if not exists case_ref text;

update public.bankruptcy_cases
set case_ref = coalesce(
  nullif(case_ref, ''),
  'case-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
)
where case_ref is null
   or case_ref = '';

alter table public.bankruptcy_cases
alter column case_ref set not null;

create unique index if not exists idx_bankruptcy_cases_case_ref_unique
  on public.bankruptcy_cases(case_ref);

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or exists (
      select 1
      from jsonb_array_elements_text(coalesce(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb)) as roles(role)
      where lower(roles.role) = 'admin'
    );
$$;

drop policy if exists "Admins can select all bankruptcy cases" on public.bankruptcy_cases;
create policy "Admins can select all bankruptcy cases"
on public.bankruptcy_cases
for select
using (public.is_admin_user());

drop policy if exists "Admins can select all case responses" on public.case_responses;
create policy "Admins can select all case responses"
on public.case_responses
for select
using (public.is_admin_user());

drop policy if exists "Admins can select all case audit events" on public.case_audit_events;
create policy "Admins can select all case audit events"
on public.case_audit_events
for select
using (public.is_admin_user());

create or replace function public.case_packet(case_uuid uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  with case_data as (
    select *
    from public.bankruptcy_cases
    where id = case_uuid
      and (user_id = auth.uid() or public.is_admin_user())
  ),
  response_data as (
    select step_id, payload, completed, updated_at
    from public.case_responses
    where case_id = case_uuid
  )
  select jsonb_build_object(
    'generated_at', timezone('utc', now()),
    'case', to_jsonb(case_data),
    'responses', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'step_id', step_id,
            'payload', payload,
            'completed', completed,
            'updated_at', updated_at
          )
        )
        from response_data
      ),
      '[]'::jsonb
    )
  )
  from case_data;
$$;

grant execute on function public.case_packet(uuid) to authenticated;
