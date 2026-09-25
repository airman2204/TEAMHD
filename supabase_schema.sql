-- ==============================================================================
-- PLAN DE IMPLEMENTACIÓN: SAAS FITNESS MULTI-TENANT CON RLS & AGENTES AUTÓNOMOS
-- Ejecutar en Supabase -> SQL Editor
-- ==============================================================================

-- 0. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 1. Tabla de Coaches (Tenants / Entrenadores)
create table if not exists public.coaches (
  id uuid references auth.users(id) on delete cascade primary key,
  business_name text not null,
  slug text unique not null,
  brand_color text default '#eab308',
  secondary_color text default '#f97316',
  logo_url text,
  whatsapp_number text,
  stripe_customer_id text,
  subscription_status text default 'trialing',
  created_at timestamptz default now()
);

-- 2. Tabla de Atletas (Vinculados al Coach)
create table if not exists public.athletes (
  id uuid references auth.users(id) on delete cascade primary key,
  coach_id uuid references public.coaches(id) on delete cascade not null,
  full_name text not null,
  phone text not null,
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  goal text default 'Hipertrofia',
  injuries_notes text,
  is_active boolean default true,
  avatar_url text,
  created_at timestamptz default now()
);

-- 3. Biblioteca de Ejercicios (Globales o Propios del Coach)
create table if not exists public.exercises (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references public.coaches(id) on delete cascade, -- NULL = Ejercicio global
  name text not null,
  muscle_group text not null,
  video_url text,
  form_cues text[] default '{}',
  created_at timestamptz default now()
);

-- 4. Rutinas Semanales
create table if not exists public.routines (
  id uuid default uuid_generate_v4() primary key,
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  day_of_week text not null check (day_of_week in ('Lun','Mar','Mié','Jue','Vie','Sáb','Dom','mon','tue','wed','thu','fri','sat','sun')),
  session_title text not null,
  supplementation_notes text,
  updated_at timestamptz default now(),
  unique (athlete_id, day_of_week)
);

-- 5. Items de Ejercicio en Rutina
create table if not exists public.routine_items (
  id uuid default uuid_generate_v4() primary key,
  routine_id uuid references public.routines(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete restrict not null,
  target_sets int not null default 4,
  target_reps text not null default '10-12',
  target_weight_kg numeric(5,2) default 0,
  rest_seconds int default 90,
  order_index int not null default 0
);

-- 6. Logs de Entrenamiento en Vivo (Bitácora de Gym)
create table if not exists public.workout_logs (
  id uuid default uuid_generate_v4() primary key,
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  routine_item_id uuid references public.routine_items(id) on delete cascade not null,
  actual_weight_kg numeric(5,2),
  actual_reps int,
  is_completed boolean default false,
  feedback_notes text,
  logged_at timestamptz default now()
);

-- 7. Alertas del Agente de Triage & Feedback Médico
create table if not exists public.coach_alerts (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references public.coaches(id) on delete cascade not null,
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  exercise_name text not null,
  feedback_text text not null,
  severity text check (severity in ('INFORMATIVA', 'FATIGA', 'RIESGO_LESIÓN', 'normal', 'alert', 'success')) default 'normal',
  ai_triage_suggestion text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.coaches enable row level security;
alter table public.athletes enable row level security;
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_items enable row level security;
alter table public.workout_logs enable row level security;
alter table public.coach_alerts enable row level security;

-- Políticas de RLS
create policy "Coaches can manage own profile"
  on public.coaches for all
  using (auth.uid() = id);

create policy "Athletes read own, coach manages"
  on public.athletes for all
  using (auth.uid() = id or auth.uid() = coach_id);

create policy "Exercises viewable by coach or global"
  on public.exercises for select
  using (coach_id is null or auth.uid() = coach_id);

create policy "Athletes view own routines"
  on public.routines for all
  using (auth.uid() = athlete_id or auth.uid() in (select coach_id from public.athletes where id = routines.athlete_id));

create policy "Routine items accessible by athlete or coach"
  on public.routine_items for all
  using (true);

create policy "Athletes manage their logs"
  on public.workout_logs for all
  using (auth.uid() = athlete_id or auth.uid() in (select coach_id from public.athletes where id = workout_logs.athlete_id));

create policy "Coaches view their alerts"
  on public.coach_alerts for all
  using (auth.uid() = coach_id);
