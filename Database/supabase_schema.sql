-- MoveNest Postgres schema for Supabase.
-- Translated from Backend/src/db/schema.sql (SQLite) - same tables, same
-- relationships, same cascade-delete behavior. Run this once in the
-- Supabase SQL Editor against a fresh project.
--
-- Key difference from SQLite: `users.id` is now a foreign key into
-- Supabase's own `auth.users` table, rather than an app-generated id with
-- no relation to anything. That's what lets auth.uid() in the RLS policies
-- below actually mean something once real Supabase Auth is wired up - this
-- file only defines the rules; nothing enforces them until sign-in exists.
--
-- Ids stay app-generated (crypto.randomUUID(), matching Backend/src/utils/id.ts)
-- for every table except users, whose id must equal the matching auth.users id.
-- The gen_random_uuid() defaults below are just a safety net for rows ever
-- inserted without an explicit id (e.g. testing from the SQL Editor).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.moves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default '',
  move_date text not null default '',
  origin text not null default '',
  destination text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  move_id uuid not null references public.moves(id) on delete cascade,
  name text not null,
  type text not null,
  display_name text not null,
  icon text not null,
  color text not null
);

create table if not exists public.boxes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  packed boolean not null default false,
  unpacked boolean not null default false,
  fragile boolean not null default false,
  essential boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references public.boxes(id) on delete cascade,
  name text not null,
  packed boolean not null default false,
  unpacked boolean not null default false,
  fragile boolean not null default false,
  essential boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  box_id uuid references public.boxes(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  data_url text not null,
  caption text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  constraint photos_owner_xor check ((box_id is null) != (item_id is null))
);

create index if not exists idx_moves_user on public.moves(user_id);
create index if not exists idx_rooms_move on public.rooms(move_id);
create index if not exists idx_boxes_room on public.boxes(room_id);
create index if not exists idx_items_box on public.items(box_id);
create index if not exists idx_photos_box on public.photos(box_id);
create index if not exists idx_photos_item on public.photos(item_id);

-- ---------------------------------------------------------------------------
-- Row Level Security - every table locked down to its owning user via auth.uid()
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.moves enable row level security;
alter table public.rooms enable row level security;
alter table public.boxes enable row level security;
alter table public.items enable row level security;
alter table public.photos enable row level security;

create policy "users manage their own row"
  on public.users for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "users manage their own moves"
  on public.moves for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users manage their own rooms"
  on public.rooms for all
  using (
    exists (
      select 1 from public.moves
      where moves.id = rooms.move_id
        and moves.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.moves
      where moves.id = rooms.move_id
        and moves.user_id = auth.uid()
    )
  );

create policy "users manage their own boxes"
  on public.boxes for all
  using (
    exists (
      select 1 from public.rooms
      join public.moves on moves.id = rooms.move_id
      where rooms.id = boxes.room_id
        and moves.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.rooms
      join public.moves on moves.id = rooms.move_id
      where rooms.id = boxes.room_id
        and moves.user_id = auth.uid()
    )
  );

create policy "users manage their own items"
  on public.items for all
  using (
    exists (
      select 1 from public.boxes
      join public.rooms on rooms.id = boxes.room_id
      join public.moves on moves.id = rooms.move_id
      where boxes.id = items.box_id
        and moves.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.boxes
      join public.rooms on rooms.id = boxes.room_id
      join public.moves on moves.id = rooms.move_id
      where boxes.id = items.box_id
        and moves.user_id = auth.uid()
    )
  );

create policy "users manage their own photos"
  on public.photos for all
  using (
    (box_id is not null and exists (
      select 1 from public.boxes
      join public.rooms on rooms.id = boxes.room_id
      join public.moves on moves.id = rooms.move_id
      where boxes.id = photos.box_id
        and moves.user_id = auth.uid()
    ))
    or
    (item_id is not null and exists (
      select 1 from public.items
      join public.boxes on boxes.id = items.box_id
      join public.rooms on rooms.id = boxes.room_id
      join public.moves on moves.id = rooms.move_id
      where items.id = photos.item_id
        and moves.user_id = auth.uid()
    ))
  )
  with check (
    (box_id is not null and exists (
      select 1 from public.boxes
      join public.rooms on rooms.id = boxes.room_id
      join public.moves on moves.id = rooms.move_id
      where boxes.id = photos.box_id
        and moves.user_id = auth.uid()
    ))
    or
    (item_id is not null and exists (
      select 1 from public.items
      join public.boxes on boxes.id = items.box_id
      join public.rooms on rooms.id = boxes.room_id
      join public.moves on moves.id = rooms.move_id
      where items.id = photos.item_id
        and moves.user_id = auth.uid()
    ))
  );
