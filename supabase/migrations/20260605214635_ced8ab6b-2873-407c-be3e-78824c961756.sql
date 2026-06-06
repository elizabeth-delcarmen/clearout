CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  item text NOT NULL,
  price numeric NOT NULL,
  type text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  views text,
  favourites text,
  messages text,
  sold boolean NOT NULL DEFAULT false,
  sold_when text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO anon, authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.listings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON public.listings FOR DELETE USING (true);