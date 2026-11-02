-- Bet Tracker · esquema de Supabase
-- Ejecuta este archivo completo en el SQL Editor de tu proyecto.

create extension if not exists pgcrypto;

create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  odds numeric(10, 2) not null check (odds > 1),
  stake numeric(12, 2) not null check (stake > 0),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'WON', 'LOST', 'CASHOUT')),
  cash_out numeric(12, 2),
  created_at timestamptz not null default now()
);

create table if not exists public.bet_legs (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets (id) on delete cascade,
  "match" text not null,
  competition text not null,
  market text not null,
  selection text not null,
  odds numeric(10, 2) not null check (odds > 1),
  position integer not null default 0
);

create index if not exists bet_legs_bet_id_idx
  on public.bet_legs (bet_id);

create index if not exists bets_user_id_created_at_idx
  on public.bets (user_id, created_at desc);

alter table public.bets enable row level security;
alter table public.bet_legs enable row level security;

-- Políticas de apuestas
drop policy if exists "bets_select_own" on public.bets;
create policy "bets_select_own" on public.bets
  for select using (auth.uid() = user_id);

drop policy if exists "bets_insert_own" on public.bets;
create policy "bets_insert_own" on public.bets
  for insert with check (auth.uid() = user_id);

drop policy if exists "bets_update_own" on public.bets;
create policy "bets_update_own" on public.bets
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "bets_delete_own" on public.bets;
create policy "bets_delete_own" on public.bets
  for delete using (auth.uid() = user_id);

-- Políticas de selecciones
drop policy if exists "bet_legs_select_own" on public.bet_legs;
create policy "bet_legs_select_own" on public.bet_legs
  for select using (
    exists (
      select 1 from public.bets b
      where b.id = bet_legs.bet_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "bet_legs_insert_own" on public.bet_legs;
create policy "bet_legs_insert_own" on public.bet_legs
  for insert with check (
    exists (
      select 1 from public.bets b
      where b.id = bet_legs.bet_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "bet_legs_update_own" on public.bet_legs;
create policy "bet_legs_update_own" on public.bet_legs
  for update using (
    exists (
      select 1 from public.bets b
      where b.id = bet_legs.bet_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "bet_legs_delete_own" on public.bet_legs;
create policy "bet_legs_delete_own" on public.bet_legs
  for delete using (
    exists (
      select 1 from public.bets b
      where b.id = bet_legs.bet_id and b.user_id = auth.uid()
    )
  );

-- Crea una apuesta con sus selecciones de forma atómica
create or replace function public.create_bet(
  p_odds numeric,
  p_stake numeric,
  p_legs jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_bet_id uuid;
  v_leg jsonb;
  v_position integer := 0;
begin
  insert into public.bets (user_id, odds, stake, status)
  values (auth.uid(), p_odds, p_stake, 'PENDING')
  returning id into v_bet_id;

  for v_leg in select * from jsonb_array_elements(p_legs)
  loop
    insert into public.bet_legs (
      bet_id, "match", competition, market, selection, odds, position
    )
    values (
      v_bet_id,
      v_leg ->> 'match',
      v_leg ->> 'competition',
      v_leg ->> 'market',
      v_leg ->> 'selection',
      (v_leg ->> 'odds')::numeric,
      v_position
    );

    v_position := v_position + 1;
  end loop;

  return v_bet_id;
end;
$$;

-- Actualiza una apuesta y reemplaza sus selecciones de forma atómica
create or replace function public.update_bet(
  p_bet_id uuid,
  p_odds numeric,
  p_stake numeric,
  p_legs jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_leg jsonb;
  v_position integer := 0;
begin
  update public.bets
    set odds = p_odds, stake = p_stake
    where id = p_bet_id and user_id = auth.uid();

  if not found then
    raise exception 'No se encontró la apuesta.';
  end if;

  delete from public.bet_legs where bet_id = p_bet_id;

  for v_leg in select * from jsonb_array_elements(p_legs)
  loop
    insert into public.bet_legs (
      bet_id, "match", competition, market, selection, odds, position
    )
    values (
      p_bet_id,
      v_leg ->> 'match',
      v_leg ->> 'competition',
      v_leg ->> 'market',
      v_leg ->> 'selection',
      (v_leg ->> 'odds')::numeric,
      v_position
    );

    v_position := v_position + 1;
  end loop;
end;
$$;

-- Permisos explícitos para la Data API.
-- Desde el 30/10/2026 Supabase ya no expone automáticamente las tablas nuevas
-- de `public`, así que los GRANT deben hacerse a mano (aunque RLS siga activo).
grant usage on schema public to authenticated;

grant select, insert, update, delete on public.bets to authenticated;
grant select, insert, update, delete on public.bet_legs to authenticated;

revoke all on function public.create_bet(numeric, numeric, jsonb) from public, anon;
grant execute on function public.create_bet(numeric, numeric, jsonb) to authenticated;

revoke all on function public.update_bet(uuid, numeric, numeric, jsonb) from public, anon;
grant execute on function public.update_bet(uuid, numeric, numeric, jsonb) to authenticated;
