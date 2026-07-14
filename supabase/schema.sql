-- Supabase Postgres schema for the admin dashboard.
-- Mirrors the former Mongoose models. Nested/embedded data is stored as JSONB
-- to preserve the exact JSON shape the React client already renders.
--
-- Primary keys are TEXT holding the original 24-char hex ObjectId strings, so all
-- cross-references (product_id, user_id, products[], affiliate_sales[]) stay valid
-- and the demo data can be imported verbatim.
--
-- Run this once in the Supabase SQL editor (or via `psql`) before importing data.

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists users (
  id            text primary key,
  name          text not null,
  email         text not null unique,
  city          text,
  state         text,
  country       text,
  occupation    text,
  phone_number  text,
  transactions  jsonb not null default '[]'::jsonb,
  role          text not null default 'admin'
                  check (role in ('user', 'admin', 'superadmin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists users_role_idx on users (role);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists products (
  id           text primary key,
  name         text,
  price        numeric,
  description  text,
  category     text,
  rating       numeric,
  supply       integer,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- product_stats  (soft ref: product_id -> products.id)
-- ---------------------------------------------------------------------------
create table if not exists product_stats (
  id                      text primary key,
  product_id              text,
  yearly_sales_total      numeric,
  yearly_total_sold_units numeric,
  year                    integer,
  monthly_data            jsonb,
  daily_data              jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists product_stats_product_id_idx on product_stats (product_id);

-- ---------------------------------------------------------------------------
-- transactions  (soft ref: user_id -> users.id; products = jsonb array of product ids)
-- ---------------------------------------------------------------------------
create table if not exists transactions (
  id          text primary key,
  user_id     text,
  cost        text,
  products    jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists transactions_user_id_idx on transactions (user_id);
create index if not exists transactions_cost_idx on transactions (cost);
create index if not exists transactions_created_at_idx on transactions (created_at desc);

-- ---------------------------------------------------------------------------
-- overall_stats
-- ---------------------------------------------------------------------------
create table if not exists overall_stats (
  id                      text primary key,
  total_customers         numeric,
  yearly_sales_total      numeric,
  yearly_total_sold_units numeric,
  year                    integer,
  monthly_data            jsonb,
  daily_data              jsonb,
  sales_by_category       jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- affiliate_stats  (soft ref: user_id -> users.id; affiliate_sales = jsonb array of transaction ids)
-- ---------------------------------------------------------------------------
create table if not exists affiliate_stats (
  id               text primary key,
  user_id          text,
  affiliate_sales  jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists affiliate_stats_user_id_idx on affiliate_stats (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Enable RLS with NO policies. The backend connects with the service-role key,
-- which bypasses RLS, so the API keeps working while anon/public access is denied.
-- ---------------------------------------------------------------------------
alter table users           enable row level security;
alter table products        enable row level security;
alter table product_stats   enable row level security;
alter table transactions    enable row level security;
alter table overall_stats   enable row level security;
alter table affiliate_stats enable row level security;
