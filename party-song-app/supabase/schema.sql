create extension if not exists pgcrypto;

create table if not exists public.song_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  played_at timestamptz,
  status text not null default 'queued'
    check (status in ('queued', 'played')),
  spotify_track_id text not null,
  title text not null,
  artist text not null,
  cover_url text,
  spotify_url text,
  table_label text,
  dedication_recipient text,
  dedication_sender text,
  dedication_message text
);

create index if not exists song_requests_status_created_idx
  on public.song_requests (status, created_at);

alter table public.song_requests enable row level security;

comment on table public.song_requests is
  'Richieste musicali inviate dagli invitati e gestite dalla console DJ.';
