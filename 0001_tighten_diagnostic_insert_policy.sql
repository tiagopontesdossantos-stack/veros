DROP POLICY IF EXISTS "Anyone can submit a diagnostic request" ON public.diagnostic_requests;
CREATE POLICY "Anyone can submit a valid diagnostic request" ON public.diagnostic_requests
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 2 AND 100
  AND char_length(btrim(company)) BETWEEN 1 AND 120
  AND char_length(btrim(role)) BETWEEN 1 AND 80
  AND char_length(email) BETWEEN 5 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(whatsapp) BETWEEN 8 AND 20
  AND char_length(segment) BETWEEN 1 AND 100
  AND char_length(revenue_range) BETWEEN 1 AND 100
  AND char_length(btrim(challenge)) BETWEEN 1 AND 1000
  AND char_length(source) BETWEEN 1 AND 60
);