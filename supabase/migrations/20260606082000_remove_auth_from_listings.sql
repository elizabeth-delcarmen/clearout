DROP POLICY IF EXISTS "Users read own listings" ON public.listings;
DROP POLICY IF EXISTS "Users insert own listings" ON public.listings;
DROP POLICY IF EXISTS "Users update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users delete own listings" ON public.listings;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO anon, authenticated;

CREATE POLICY "Public read" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.listings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON public.listings FOR DELETE USING (true);

DROP INDEX IF EXISTS listings_user_id_idx;
ALTER TABLE public.listings DROP COLUMN IF EXISTS user_id;
