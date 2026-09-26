-- Ejecutar en Supabase: SQL Editor

create extension if not exists "pgcrypto";

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  correo text not null unique,
  password text not null,
  telefono text,
  rol text not null default 'cliente',
  created_at timestamptz not null default now()
);

create table if not exists autos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  marca text not null,
  modelo text not null,
  anio integer,
  placa text,
  created_at timestamptz not null default now()
);

create table if not exists piezas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  marca text,
  categoria text,
  precio numeric(12, 2) not null default 0,
  stock integer not null default 0,
  codigo text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_autos_usuario_id on autos(usuario_id);
create index if not exists idx_piezas_categoria on piezas(categoria);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_piezas_updated_at on piezas;
create trigger trg_piezas_updated_at
before update on piezas
for each row
execute procedure set_updated_at();

alter table usuarios enable row level security;
alter table autos enable row level security;
alter table piezas enable row level security;

create policy "usuarios_all" on usuarios for all using (true) with check (true);
create policy "autos_all" on autos for all using (true) with check (true);
create policy "piezas_all" on piezas for all using (true) with check (true);
