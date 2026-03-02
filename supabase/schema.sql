-- AOL Chatbot — Supabase schema
-- Run this in Supabase SQL Editor to create all tables.

create extension if not exists "pgcrypto";

-- Users / Sessions
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  created_at timestamptz default now(),
  last_active timestamptz default now(),
  preferences jsonb default '{}'::jsonb
);

-- Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  started_at timestamptz default now(),
  ended_at timestamptz,
  mode text check (mode in ('platform', 'global')) default 'platform',
  message_count int default 0,
  language_detected text default 'en',
  title text
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now(),
  response_time_ms int,
  rating int check (rating in (-1, 0, 1)) default 0,
  data_source text check (data_source in (
    'website', 'text_file', 'external_link', 'global', 'fallback', 'greeting'
  )),
  language text default 'en',
  suggested_questions jsonb default '[]'::jsonb
);

-- Analytics Events
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_conversations_user on conversations(user_id);
create index if not exists idx_conversations_started on conversations(started_at);
create index if not exists idx_analytics_user on analytics_events(user_id);
create index if not exists idx_analytics_type on analytics_events(event_type);
create index if not exists idx_analytics_created on analytics_events(created_at);
create index if not exists idx_messages_created on messages(created_at);

alter table users enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table analytics_events enable row level security;

-- Allow anonymous read/write for chatbot (use service role or anon with policies in production)
create policy "Users can manage own row by session_id" on users
  for all using (true);

create policy "Conversations accessible by user" on conversations
  for all using (true);

create policy "Messages accessible by conversation" on messages
  for all using (true);

create policy "Analytics accessible" on analytics_events
  for all using (true);
