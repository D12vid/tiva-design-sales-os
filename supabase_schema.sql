-- Archivo: supabase_schema.sql
create table if not exists public.sales (
  id uuid default gen_random_uuid() primary key,
  week_id integer not null default 1,
  sale_date date not null default current_date,
  client_name text not null,
  product text not null,
  price_usd numeric(10,2) not null check (price_usd > 0),
  amount_bs numeric(14,2) default 0,
  payment_method text not null,
  channel text not null default 'Meta Ads',
  commission_usd numeric(10,2) not null,
  is_template_row boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  concept text not null,
  frequency text not null,
  amount_usd numeric(10,2) not null check (amount_usd >= 0),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.funnel_settings (
  id integer primary key default 1,
  visitors integer not null default 2450,
  leads integer not null default 480,
  exchange_rate numeric(10,2) not null default 60.00,
  updated_at timestamptz default now()
);

-- Insertar gastos fijos iniciales de Tiva Design ($58.30 USD)
insert into public.expenses (concept, frequency, amount_usd, notes)
values
  ('Almacenamiento Google Drive', 'Trimestral', 2.50, 'Almacenamiento en la nube'),
  ('Publicidad (Ads)', 'Semanal', 42.00, 'Presupuesto semanal de anuncios'),
  ('Pago de Línea Movistar', 'Mensual', 3.80, 'Línea operativa Movistar'),
  ('Bono de trabajador', 'Semanal', 10.00, 'Bono por superar meta de 15 ventas');

insert into public.funnel_settings (id, visitors, leads, exchange_rate)
values (1, 2450, 480, 60.00)
on conflict (id) do nothing;

-- Habilitar políticas de acceso y Realtime
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.funnel_settings enable row level security;

create policy "Acceso total ventas Tiva" on public.sales for all using (true) with check (true);
create policy "Acceso total gastos Tiva" on public.expenses for all using (true) with check (true);
create policy "Acceso total embudo Tiva" on public.funnel_settings for all using (true) with check (true);

alter publication supabase_realtime add table public.sales;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.funnel_settings;