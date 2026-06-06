ALTER TABLE public.listings ADD COLUMN user_id uuid;
-- No existing data needs backfill (single-user MVP, fresh table)
ALTER TABLE public.listings ALTER COLUMN user_id SET NOT NULL;

DROP POLICY IF EXISTS "Public read" ON public.listings;
DROP POLICY IF EXISTS "Public insert" ON public.listings;
DROP POLICY IF EXISTS "Public update" ON public.listings;
DROP POLICY IF EXISTS "Public delete" ON public.listings;

REVOKE ALL ON public.listings FROM anon;

CREATE POLICY "Users read own listings" ON public.listings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own listings" ON public.listings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own listings" ON public.listings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own listings" ON public.listings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS listings_user_id_idx ON public.listings(user_id);