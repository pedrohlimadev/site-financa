-- Baseline idempotente para o banco existente, criado anteriormente pelo SQL Editor.
-- Não insere dados pessoais nem remove tabelas.
-- Execute no SQL Editor do Supabase (plano Free).
-- Os dados são privados por usuário autenticado.
create table if not exists public.finance_documents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_data jsonb not null default '{"schemaVersion":1,"items":[],"settled":{}}'::jsonb,
  legacy_data jsonb,
  updated_at timestamptz not null default now(),
  constraint monthly_is_object check (jsonb_typeof(monthly_data)='object'),
  constraint legacy_is_object check (legacy_data is null or jsonb_typeof(legacy_data)='object')
);
alter table public.finance_documents enable row level security;
revoke all on public.finance_documents from anon;
grant select, insert, update, delete on public.finance_documents to authenticated;
drop policy if exists finance_documents_select on public.finance_documents;
drop policy if exists finance_documents_insert on public.finance_documents;
drop policy if exists finance_documents_update on public.finance_documents;
drop policy if exists finance_documents_delete on public.finance_documents;
create policy finance_documents_select on public.finance_documents for select to authenticated using ((select auth.uid()) = user_id);
create policy finance_documents_insert on public.finance_documents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy finance_documents_update on public.finance_documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy finance_documents_delete on public.finance_documents for delete to authenticated using ((select auth.uid()) = user_id);
