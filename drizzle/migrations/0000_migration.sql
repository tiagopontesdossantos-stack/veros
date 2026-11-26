CREATE TABLE public.diagnostic_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  company text NOT NULL CHECK (char_length(company) BETWEEN 1 AND 120),
  role text NOT NULL CHECK (char_length(role) BETWEEN 1 AND 80),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 255),
  whatsapp text NOT NULL CHECK (char_length(whatsapp) BETWEEN 10 AND 20),
  segment text NOT NULL CHECK (char_length(segment) <= 80),
  revenue_range text NOT NULL CHECK (char_length(revenue_range) <= 80),
  challenge text NOT NULL CHECK (char_length(challenge) BETWEEN 10 AND 1000),
  source text NOT NULL DEFAULT 'site' CHECK (char_length(source) <= 60)
);
GRANT INSERT ON public.diagnostic_requests TO anon, authenticated;
GRANT ALL ON public.diagnostic_requests TO service_role;
ALTER TABLE public.diagnostic_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a diagnostic request" ON public.diagnostic_requests FOR INSERT TO anon, authenticated WITH CHECK (true);