create table if not exists public.pay_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hourly_wage text not null default '12.59',
  tax_percentage text not null default '20',
  pension_percentage text not null default '7.15',
  unemployment_percentage text not null default '0.89',
  other_deductions_percentage text not null default '0',
  updated_at timestamptz not null default now()
);

create table if not exists public.work_shifts (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  date text not null,
  start_time text,
  end_time text,
  break_minutes text,
  normal_hours text not null default '0',
  evening_hours text not null default '0',
  night_hours text not null default '0',
  sunday_hours text not null default '0',
  overtime_50_hours text not null default '0',
  overtime_100_hours text not null default '0',
  special_50_hours text not null default '0',
  holiday_100_hours text not null default '0',
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.pay_settings enable row level security;
alter table public.work_shifts enable row level security;

drop policy if exists "Users can read own pay settings" on public.pay_settings;
create policy "Users can read own pay settings"
on public.pay_settings for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own pay settings" on public.pay_settings;
create policy "Users can insert own pay settings"
on public.pay_settings for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own pay settings" on public.pay_settings;
create policy "Users can update own pay settings"
on public.pay_settings for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pay settings" on public.pay_settings;
create policy "Users can delete own pay settings"
on public.pay_settings for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own work shifts" on public.work_shifts;
create policy "Users can read own work shifts"
on public.work_shifts for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own work shifts" on public.work_shifts;
create policy "Users can insert own work shifts"
on public.work_shifts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own work shifts" on public.work_shifts;
create policy "Users can update own work shifts"
on public.work_shifts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own work shifts" on public.work_shifts;
create policy "Users can delete own work shifts"
on public.work_shifts for delete
to authenticated
using (auth.uid() = user_id);
