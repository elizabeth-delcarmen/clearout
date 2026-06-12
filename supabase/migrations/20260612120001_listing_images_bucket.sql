INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Public insert listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Public update listing images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'listing-images')
  WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Public delete listing images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listing-images');
