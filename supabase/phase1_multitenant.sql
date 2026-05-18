-- ================================================================
-- FLOW — Fase 1: Schema Multi-Tenant com RLS
-- Execute no Supabase: SQL Editor → New query → Run
-- ================================================================

-- ----------------------------------------------------------------
-- LIMPA TUDO (ordem importa por foreign keys)
-- ----------------------------------------------------------------
drop table if exists appointments      cascade;
drop table if exists patients          cascade;
drop table if exists automation_flows  cascade;
drop table if exists bot_metrics       cascade;
drop table if exists clinics           cascade;
drop function if exists get_clinic_id  cascade;
drop function if exists set_updated_at cascade;

-- ----------------------------------------------------------------
-- TRIGGER: atualiza updated_at automaticamente
-- ----------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ================================================================
-- TABELA: clinics  (os tenants — cada clínica é um tenant)
-- ================================================================
create table clinics (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete set null,
  name        text not null,
  phone       text,
  email       text,
  plan        text not null default 'trial'
                check (plan in ('trial', 'free', 'pro', 'enterprise')),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_clinics_updated_at
  before update on clinics
  for each row execute function set_updated_at();

-- ================================================================
-- FUNÇÃO HELPER: retorna o clinic_id do usuário autenticado
-- Usada nas políticas de RLS para isolar os dados por tenant
-- ================================================================
create or replace function get_clinic_id()
returns uuid
language sql
security definer
stable
as $$
  select id from clinics where owner_id = auth.uid() limit 1;
$$;

-- ================================================================
-- TABELA: patients
-- ================================================================
create table patients (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references clinics(id) on delete cascade,
  name        text not null,
  phone       text not null,
  email       text,
  status      text not null default 'active'
                check (status in ('active', 'new', 'missed', 'inactive')),
  rating      numeric(2,1) check (rating between 0 and 5),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_patients_updated_at
  before update on patients
  for each row execute function set_updated_at();

create index idx_patients_clinic on patients(clinic_id);
create index idx_patients_status on patients(clinic_id, status);

-- ================================================================
-- TABELA: appointments
-- ================================================================
create table appointments (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  patient_id    uuid not null references patients(id) on delete cascade,
  procedure     text not null,
  value         numeric(10,2) not null default 0,
  scheduled_at  timestamptz not null,
  status        text not null default 'scheduled'
                  check (status in ('confirmed','pending','missed','scheduled','rescheduling')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();

create index idx_appointments_clinic    on appointments(clinic_id);
create index idx_appointments_patient   on appointments(clinic_id, patient_id);
create index idx_appointments_status    on appointments(clinic_id, status);
create index idx_appointments_scheduled on appointments(clinic_id, scheduled_at);

-- ================================================================
-- TABELA: automation_flows
-- ================================================================
create table automation_flows (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references clinics(id) on delete cascade,
  name        text not null,
  description text,
  icon        text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_automation_clinic on automation_flows(clinic_id);

-- ================================================================
-- TABELA: bot_metrics
-- ================================================================
create table bot_metrics (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  date          date not null default current_date,
  messages_sent integer not null default 0,
  resolved      integer not null default 0,
  scheduled     integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (clinic_id, date)
);

create index idx_bot_metrics_clinic on bot_metrics(clinic_id);

-- ================================================================
-- RLS — Row Level Security
-- Cada clínica SÓ acessa seus próprios dados via get_clinic_id()
-- ================================================================

alter table clinics           enable row level security;
alter table patients          enable row level security;
alter table appointments      enable row level security;
alter table automation_flows  enable row level security;
alter table bot_metrics       enable row level security;

-- clinics: cada usuário só vê/edita sua própria clínica
create policy "clinic: owner access"
  on clinics for all
  using  (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- patients
create policy "patients: clinic isolation"
  on patients for all
  using  (clinic_id = get_clinic_id())
  with check (clinic_id = get_clinic_id());

-- appointments
create policy "appointments: clinic isolation"
  on appointments for all
  using  (clinic_id = get_clinic_id())
  with check (clinic_id = get_clinic_id());

-- automation_flows
create policy "flows: clinic isolation"
  on automation_flows for all
  using  (clinic_id = get_clinic_id())
  with check (clinic_id = get_clinic_id());

-- bot_metrics
create policy "metrics: clinic isolation"
  on bot_metrics for all
  using  (clinic_id = get_clinic_id())
  with check (clinic_id = get_clinic_id());

-- ================================================================
-- crm_clients: mantida separada (painel ADM, sem RLS de tenant)
-- ================================================================
drop table if exists crm_clients cascade;

create table crm_clients (
  id               uuid primary key default gen_random_uuid(),
  clinic_name      text not null,
  owner_name       text not null,
  email            text not null,
  phone            text not null,
  city             text,
  plan             text not null default 'free'
                     check (plan in ('free', 'pro', 'enterprise')),
  plan_status      text not null default 'trial'
                     check (plan_status in ('trial', 'active', 'overdue', 'cancelled')),
  plan_expires_at  date,
  monthly_value    numeric(10,2) not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table crm_clients enable row level security;

-- crm_clients: só a anon key com service_role acessa (painel ADM)
-- Por ora liberamos via policy aberta (Phase 2 vai restringir com auth ADM)
create policy "crm_clients: admin access"
  on crm_clients for all
  using (true) with check (true);

-- ================================================================
-- SEED: clínica demo para testar antes da auth estar pronta
-- ================================================================
insert into clinics (id, name, phone, email, plan) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Clínica Demo – Dra. Ana', '(11) 99999-0000', 'demo@flow.com.br', 'pro');

insert into patients (clinic_id, name, phone, email, status, rating) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Maria Santos',    '(11) 98821-3344', 'maria@email.com',    'active', 5.0),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'João Almeida',    '(11) 99933-1122', 'joao@email.com',     'active', 4.5),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Lucia Ferreira',  '(11) 97744-5566', 'lucia@email.com',    'active', 5.0),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Carlos Mendes',   '(11) 96655-8899', 'carlos@email.com',   'missed', 3.0),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Ana Paula Costa', '(11) 95544-7711', 'ana@email.com',      'active', 4.8),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Roberto Lima',    '(11) 94433-2211', 'roberto@email.com',  'new',    null),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Fernanda Souza',  '(11) 93322-9988', 'fernanda@email.com', 'active', 5.0);

insert into appointments (clinic_id, patient_id, procedure, value, scheduled_at, status)
select
  'aaaaaaaa-0000-0000-0000-000000000001',
  p.id,
  proc.procedure,
  proc.value,
  now() + proc.offset,
  proc.status
from patients p
cross join (values
  ('Limpeza',     180::numeric, interval '1 hour',  'confirmed'),
  ('Canal',       800::numeric, interval '2 hours', 'pending'),
  ('Ortodontia',  350::numeric, interval '3 hours', 'confirmed'),
  ('Clareamento', 600::numeric, interval '-2 hours','missed'),
  ('Extração',    250::numeric, interval '5 hours', 'pending')
) as proc(procedure, value, offset, status)
where p.name = 'Maria Santos' and proc.procedure = 'Limpeza'
   or p.name = 'João Almeida' and proc.procedure = 'Canal'
   or p.name = 'Lucia Ferreira' and proc.procedure = 'Ortodontia'
   or p.name = 'Carlos Mendes' and proc.procedure = 'Clareamento'
   or p.name = 'Ana Paula Costa' and proc.procedure = 'Extração';

insert into automation_flows (clinic_id, name, description, icon, active) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Confirmação automática',  '24h antes da consulta envia confirmação pelo WhatsApp', '📅', true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Reagendamento de faltas', 'Quando paciente falta, envia opções de reagendamento',  '🔄', true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Relatório semanal',       'Todo domingo gera e envia relatório de faturamento',    '📊', true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Pesquisa de satisfação',  '2h após consulta envia avaliação pelo WhatsApp',        '⭐', true);

insert into bot_metrics (clinic_id, date, messages_sent, resolved, scheduled) values
  ('aaaaaaaa-0000-0000-0000-000000000001', current_date, 47, 44, 8);

insert into crm_clients (clinic_name, owner_name, email, phone, city, plan, plan_status, plan_expires_at, monthly_value, notes) values
  ('Clínica Sorriso Feliz',   'Dra. Ana Souza',      'ana@sorrisofeliz.com.br',  '(11) 99101-2233', 'São Paulo',      'pro',        'active',    current_date + 20, 197.00, 'Cliente desde o lançamento.'),
  ('OdontoCenter SP',         'Dr. Marcos Pereira',  'marcos@odontocenter.com',  '(11) 98200-4455', 'São Paulo',      'enterprise', 'active',    current_date + 15, 497.00, 'Rede com 3 unidades.'),
  ('Consultório Dra. Lúcia',  'Dra. Lúcia Ferreira', 'lucia@consultorio.com',    '(19) 97300-6677', 'Campinas',       'pro',        'trial',     current_date + 7,  197.00, 'Trial expira em 7 dias.'),
  ('DentalPrime Clínica',     'Dr. Roberto Lima',    'roberto@dentalprime.com',  '(21) 96400-8899', 'Rio de Janeiro', 'free',       'active',    null,              0.00,   'Oferecer upgrade pro.'),
  ('Smile Studio BH',         'Dra. Carla Mendes',   'carla@smilestudio.com.br', '(31) 95500-1122', 'Belo Horizonte', 'pro',        'overdue',   current_date - 5,  197.00, 'Pagamento em atraso!'),
  ('Clínica Oral Curitiba',   'Dr. Paulo Santos',    'paulo@oralcuritiba.com',   '(41) 94600-3344', 'Curitiba',       'pro',        'active',    current_date + 28, 197.00, null),
  ('Odonto Saúde Porto',      'Dra. Fernanda Costa', 'fernanda@odontosaude.com', '(51) 93700-5566', 'Porto Alegre',   'enterprise', 'cancelled', null,              0.00,   'Cancelou em abril.');
