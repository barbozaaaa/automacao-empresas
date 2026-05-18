-- ============================================
-- ClinicaFlow — Schema completo
-- Execute no Supabase: SQL Editor → New query
-- ============================================

-- ==================
-- PACIENTES
-- ==================
create table if not exists patients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text,
  status      text not null default 'active'
                check (status in ('active', 'new', 'missed', 'inactive')),
  rating      numeric(2,1) check (rating between 0 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ==================
-- AGENDAMENTOS
-- ==================
create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
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

-- ==================
-- AUTOMAÇÕES
-- ==================
create table if not exists automation_flows (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  icon        text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ==================
-- MÉTRICAS DO BOT
-- ==================
create table if not exists bot_metrics (
  id            uuid primary key default gen_random_uuid(),
  date          date not null default current_date,
  messages_sent integer not null default 0,
  resolved      integer not null default 0,
  scheduled     integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (date)
);

-- ==================
-- CRM — CLIENTES DO CLINICAFLOW
-- ==================
create table if not exists crm_clients (
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

-- ==================
-- ÍNDICES
-- ==================
create index if not exists idx_appointments_patient   on appointments(patient_id);
create index if not exists idx_appointments_status    on appointments(status);
create index if not exists idx_appointments_scheduled on appointments(scheduled_at);
create index if not exists idx_patients_status        on patients(status);
create index if not exists idx_crm_clients_plan       on crm_clients(plan);
create index if not exists idx_crm_clients_status     on crm_clients(plan_status);

-- ==================
-- UPDATED_AT TRIGGER
-- ==================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_patients_updated_at
  before update on patients
  for each row execute function set_updated_at();

create trigger trg_appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();

create trigger trg_crm_clients_updated_at
  before update on crm_clients
  for each row execute function set_updated_at();

-- ==================
-- SEED — pacientes demo
-- ==================
insert into patients (id, name, phone, email, status, rating) values
  ('11111111-0000-0000-0000-000000000001', 'Maria Santos',    '(11) 98821-3344', 'maria@email.com',    'active', 5.0),
  ('11111111-0000-0000-0000-000000000002', 'João Almeida',    '(11) 99933-1122', 'joao@email.com',     'active', 4.5),
  ('11111111-0000-0000-0000-000000000003', 'Lucia Ferreira',  '(11) 97744-5566', 'lucia@email.com',    'active', 5.0),
  ('11111111-0000-0000-0000-000000000004', 'Carlos Mendes',   '(11) 96655-8899', 'carlos@email.com',   'missed', 3.0),
  ('11111111-0000-0000-0000-000000000005', 'Ana Paula Costa', '(11) 95544-7711', 'ana@email.com',      'active', 4.8),
  ('11111111-0000-0000-0000-000000000006', 'Roberto Lima',    '(11) 94433-2211', 'roberto@email.com',  'new',    null),
  ('11111111-0000-0000-0000-000000000007', 'Fernanda Souza',  '(11) 93322-9988', 'fernanda@email.com', 'active', 5.0)
on conflict (id) do nothing;

insert into appointments (patient_id, procedure, value, scheduled_at, status) values
  ('11111111-0000-0000-0000-000000000001', 'Limpeza',     180, now() + interval '1 hour',  'confirmed'),
  ('11111111-0000-0000-0000-000000000002', 'Canal',       800, now() + interval '2 hours', 'pending'),
  ('11111111-0000-0000-0000-000000000003', 'Ortodontia',  350, now() + interval '3 hours', 'confirmed'),
  ('11111111-0000-0000-0000-000000000004', 'Clareamento', 600, now() - interval '2 hours', 'missed'),
  ('11111111-0000-0000-0000-000000000005', 'Extração',    250, now() + interval '5 hours', 'pending')
on conflict do nothing;

insert into automation_flows (name, description, icon, active) values
  ('Confirmação automática',  '24h antes da consulta envia confirmação pelo WhatsApp', '📅', true),
  ('Reagendamento de faltas', 'Quando paciente falta, envia opções de reagendamento',  '🔄', true),
  ('Relatório semanal',       'Todo domingo gera e envia relatório de faturamento',    '📊', true),
  ('Pesquisa de satisfação',  '2h após consulta envia avaliação pelo WhatsApp',        '⭐', true)
on conflict do nothing;

insert into bot_metrics (date, messages_sent, resolved, scheduled) values
  (current_date, 47, 44, 8)
on conflict (date) do nothing;

-- ==================
-- SEED — clientes CRM demo
-- ==================
insert into crm_clients (clinic_name, owner_name, email, phone, city, plan, plan_status, plan_expires_at, monthly_value, notes) values
  ('Clínica Sorriso Feliz',   'Dra. Ana Souza',     'ana@sorrisofeliz.com.br',   '(11) 99101-2233', 'São Paulo',     'pro',        'active',   current_date + 20, 197.00, 'Cliente desde o lançamento, muito satisfeita.'),
  ('OdontoCenter SP',         'Dr. Marcos Pereira',  'marcos@odontocenter.com',   '(11) 98200-4455', 'São Paulo',     'enterprise', 'active',   current_date + 15, 497.00, 'Rede com 3 unidades. Potencial de expansão.'),
  ('Consultório Dra. Lúcia',  'Dra. Lúcia Ferreira', 'lucia@consultorio.com',     '(19) 97300-6677', 'Campinas',      'pro',        'trial',    current_date + 7,  197.00, 'Trial expira em 7 dias. Fazer follow-up.'),
  ('DentalPrime Clínica',     'Dr. Roberto Lima',    'roberto@dentalprime.com',   '(21) 96400-8899', 'Rio de Janeiro','free',       'active',   null,              0.00,  'No plano free. Oferecer upgrade pro.'),
  ('Smile Studio BH',         'Dra. Carla Mendes',   'carla@smilestudio.com.br',  '(31) 95500-1122', 'Belo Horizonte','pro',        'overdue',  current_date - 5,  197.00, 'Pagamento em atraso. Entrar em contato urgente.'),
  ('Clínica Oral Curitiba',   'Dr. Paulo Santos',    'paulo@oralcuritiba.com',    '(41) 94600-3344', 'Curitiba',      'pro',        'active',   current_date + 28, 197.00, null),
  ('Odonto Saúde Porto',      'Dra. Fernanda Costa', 'fernanda@odontosaude.com',  '(51) 93700-5566', 'Porto Alegre',  'enterprise', 'cancelled',null,              0.00,  'Cancelou em abril. Motivo: custo. Tentar reativar.')
on conflict do nothing;
