-- Photos Cozatti — estrutura do banco (Supabase / Postgres)
-- Como usar: Supabase → SQL Editor → cole este arquivo inteiro → Run.

-- ============ PERFIS ============
-- Um perfil por usuário (fotógrafo ou cliente), criado automaticamente no cadastro.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text unique,              -- usado no link da loja: /f/<username>
  role text not null default 'photographer' check (role in ('photographer', 'customer')),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  fee_percent numeric(5,2) not null default 8.00,   -- taxa da plataforma
  fee_customer_share numeric(5,2) not null default 0, -- quanto da taxa o cliente paga
  instagram text,
  city text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ EVENTOS ============
-- Eventos públicos (jogos, shows, corridas) onde vários fotógrafos podem se inscrever.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null default 'Outros',
  city text,
  state text,
  starts_at timestamptz not null,
  cover_url text,
  registrations_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  event_id uuid references public.events (id) on delete cascade,
  photographer_id uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, photographer_id)
);

-- ============ ÁLBUNS ============
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  title text not null,
  city text,
  category text not null default 'Ensaios',
  visibility text not null default 'listed' check (visibility in ('listed', 'unlisted', 'portfolio')),
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  price_per_photo numeric(10,2) not null default 15.00,
  album_date date not null default current_date,
  cover_url text,
  views integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============ FOTOS ============
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,         -- original (privado)
  preview_path text,                  -- versão com marca d'água (pública)
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

-- ============ VENDAS ============
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  album_id uuid references public.albums (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  subtotal numeric(10,2) not null,
  fee_amount numeric(10,2) not null default 0,
  photographer_amount numeric(10,2) not null,  -- quanto o fotógrafo recebe
  payment_provider text,
  payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  order_id uuid references public.orders (id) on delete cascade,
  photo_id uuid references public.photos (id) on delete cascade,
  price numeric(10,2) not null,
  primary key (order_id, photo_id)
);

-- ============ SAQUES ============
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  pix_key text not null,
  status text not null default 'requested' check (status in ('requested', 'paid', 'rejected')),
  created_at timestamptz not null default now()
);

-- ============ SEGURANÇA (RLS) ============
-- Cada fotógrafo só enxerga e altera os próprios dados.
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.withdrawals enable row level security;

create policy "perfil: ler próprio" on public.profiles for select using (auth.uid() = id);
create policy "perfil: editar próprio" on public.profiles for update using (auth.uid() = id);

create policy "eventos: todos logados leem" on public.events for select using (auth.role() = 'authenticated');
create policy "eventos: criar" on public.events for insert with check (auth.uid() = created_by);
create policy "eventos: editar próprio" on public.events for update using (auth.uid() = created_by);

create policy "inscrições: ler próprias" on public.event_registrations for select using (auth.uid() = photographer_id);
create policy "inscrições: inscrever-se" on public.event_registrations for insert with check (auth.uid() = photographer_id);
create policy "inscrições: cancelar" on public.event_registrations for delete using (auth.uid() = photographer_id);

create policy "álbuns: dono gerencia" on public.albums for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "álbuns: público lê listados" on public.albums for select using (visibility = 'listed' and status = 'active');

create policy "fotos: dono gerencia" on public.photos for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "vendas: fotógrafo lê" on public.orders for select using (auth.uid() = photographer_id);
create policy "itens: fotógrafo lê" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.photographer_id = auth.uid()));

create policy "saques: ler próprios" on public.withdrawals for select using (auth.uid() = photographer_id);
create policy "saques: solicitar" on public.withdrawals for insert with check (auth.uid() = photographer_id);
