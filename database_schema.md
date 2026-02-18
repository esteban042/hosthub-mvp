# Database Schema Overview

This document provides an overview of the database tables and their fields.

## `public.apartments`
- `id`: text (Primary Key)
- `host_id`: text (Foreign Key to `public.hosts`)
- `title`: text
- `description`: text
- `city`: text
- `address`: text
- `capacity`: integer
- `bedrooms`: integer
- `bathrooms`: integer
- `price_per_night`: integer
- `price_overrides`: jsonb
- `amenities`: jsonb
- `photos`: jsonb
- `is_active`: boolean
- `map_embed_url`: text
- `min_stay_nights`: integer
- `max_stay_nights`: integer
- `page_views`: integer

## `public.blocked_dates`
- `id`: text (Primary Key)
- `apartment_id`: text
- `date`: date
- `reason`: text

## `public.bookings`
- `id`: text (Primary Key)
- `apartment_id`: text (Foreign Key to `public.apartments`)
- `guest_email`: text
- `guest_phone`: text
- `num_guests`: integer
- `start_date`: date
- `end_date`: date
- `status`: text
- `total_price`: integer
- `is_deposit_paid`: boolean
- `guest_message`: text
- `deposit_amount`: integer
- `guest_name`: text
- `guest_country`: text
- `custom_booking_id`: text

## `public.hosts`
- `id`: text (Primary Key)
- `slug`: text (Unique)
- `name`: text
- `bio`: text
- `avatar`: text
- `subscription_type`: text
- `commission_rate`: integer
- `contact_email`: text
- `physical_address`: text
- `country`: text
- `phone_number`: text
- `notes`: text
- `airbnb_calendar_link`: text
- `premium_config`: jsonb
- `payment_instructions`: text
- `business_name`: text
- `landing_page_picture`: text
- `user_id`: uuid (Foreign Key to `public.users`)
- `userdb_id`: integer (Unique)
- `terms`: text
- `conditions`: text
- `faq`: text
- `social_media_links`: jsonb
- `business_id`: text
- `check_in_time`: text
- `check_out_time`: text
- `check_in_info`: text

## `public.profiles`
- `id`: uuid (Primary Key, Foreign Key to `auth.users`)
- `role`: text
- `name`: text
- `avatar_url`: text

## `public.users`
- `id`: uuid (Primary Key)
- `email`: character varying (Unique)
- `password_hash`: character varying
- `role`: character varying
- `created_at`: timestamp with time zone
- `last_login`: timestamp without time zone

---
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.apartments (
  id text NOT NULL,
  host_id text,
  title text,
  description text,
  city text,
  address text,
  capacity integer,
  bedrooms integer,
  bathrooms integer,
  price_per_night integer,
  price_overrides jsonb,
  amenities jsonb,
  photos jsonb,
  is_active boolean DEFAULT true,
  map_embed_url text,
  min_stay_nights integer,
  max_stay_nights integer,
  page_views integer DEFAULT 0,
  CONSTRAINT apartments_pkey PRIMARY KEY (id),
  CONSTRAINT apartments_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.hosts(id)
);
CREATE TABLE public.blocked_dates (
  id text NOT NULL,
  apartment_id text,
  date date,
  reason text,
  CONSTRAINT blocked_dates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bookings (
  id text NOT NULL DEFAULT gen_random_uuid(),
  apartment_id text,
  guest_email text,
  guest_phone text,
  num_guests integer,
  start_date date,
  end_date date,
  status text,
  total_price integer,
  is_deposit_paid boolean DEFAULT false,
  guest_message text,
  deposit_amount integer,
  guest_name text,
  guest_country text,
  custom_booking_id text,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_apartment_id_fkey FOREIGN KEY (apartment_id) REFERENCES public.apartments(id)
);
CREATE TABLE public.hosts (
  id text NOT NULL,
  slug text UNIQUE,
  name text,
  bio text,
  avatar text,
  subscription_type text NOT NULL DEFAULT 'basic'::text,
  commission_rate integer NOT NULL DEFAULT 3,
  contact_email text,
  physical_address text,
  country text,
  phone_number text,
  notes text,
  airbnb_calendar_link text,
  premium_config jsonb,
  payment_instructions text,
  business_name text,
  landing_page_picture text,
  user_id uuid,
  userdb_id integer UNIQUE,
  terms text,
  conditions text,
  faq text,
  social_media_links jsonb DEFAULT '{}'::jsonb,
  business_id text,
  check_in_time text,
  check_out_time text,
  check_in_info text,
  CONSTRAINT hosts_pkey PRIMARY KEY (id),
  CONSTRAINT fk_hosts_users FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role text NOT NULL,
  name text,
  avatar_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  role character varying NOT NULL DEFAULT 'host'::character varying,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  last_login timestamp without time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
