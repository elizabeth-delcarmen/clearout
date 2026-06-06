ALTER TABLE public.listings ADD COLUMN category text NOT NULL DEFAULT 'Other';
ALTER TABLE public.listings ADD COLUMN condition text NOT NULL DEFAULT 'Good';
ALTER TABLE public.listings ALTER COLUMN category DROP DEFAULT;
ALTER TABLE public.listings ALTER COLUMN condition DROP DEFAULT;