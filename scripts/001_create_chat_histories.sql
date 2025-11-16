-- Create chat_histories table for storing user chat sessions
create table if not exists public.chat_histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Chat',
  messages jsonb not null default '[]'::jsonb,
  model text not null default 'meta-llama/llama-4-maverick:free',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.chat_histories enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own chat histories" on public.chat_histories;
drop policy if exists "Users can create their own chat histories" on public.chat_histories;
drop policy if exists "Users can update their own chat histories" on public.chat_histories;
drop policy if exists "Users can delete their own chat histories" on public.chat_histories;

-- Create policies
create policy "Users can view their own chat histories"
  on public.chat_histories for select
  using (auth.uid() = user_id);

create policy "Users can create their own chat histories"
  on public.chat_histories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chat histories"
  on public.chat_histories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own chat histories"
  on public.chat_histories for delete
  using (auth.uid() = user_id);

-- Create indices for faster queries
create index if not exists chat_histories_user_id_idx on public.chat_histories(user_id);
create index if not exists chat_histories_user_created_at_idx on public.chat_histories(user_id, created_at desc);
