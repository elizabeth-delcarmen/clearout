ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS vinted_url text;
