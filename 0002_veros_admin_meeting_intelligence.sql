CREATE TYPE public.app_role AS ENUM ('admin', 'consultant');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','consultant'))
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_assign_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE public.prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name text NOT NULL,
  trade_name text,
  cnpj text,
  segment text,
  city text,
  state text,
  website text,
  contact_name text,
  contact_role text,
  phone text,
  email text,
  monthly_revenue numeric,
  employees integer,
  sellers integer,
  marketing_staff integer,
  cs_staff integer,
  average_ticket numeric,
  active_customers integer,
  products text,
  acquisition_channels text,
  tools text,
  marketing_investment numeric,
  growth_goals text,
  perceived_challenges text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnostic_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnostic_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  interviewee_name text,
  owner_id uuid,
  owner_name text,
  objective text,
  general_notes text,
  status text NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento','concluido')),
  current_question_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnostic_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.diagnostic_sections(id) ON DELETE CASCADE,
  meeting_id uuid REFERENCES public.diagnostic_meetings(id) ON DELETE CASCADE,
  spin_stage text NOT NULL CHECK (spin_stage IN ('situacao','problema','implicacao','necessidade')),
  text text NOT NULL,
  answer_type text NOT NULL DEFAULT 'text' CHECK (answer_type IN ('text','number','currency')),
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnostic_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.diagnostic_meetings(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.diagnostic_questions(id) ON DELETE CASCADE,
  answer_text text,
  answer_number numeric,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, question_id)
);

CREATE TABLE public.diagnostic_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.diagnostic_meetings(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.diagnostic_sections(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnostic_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.diagnostic_meetings(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.diagnostic_questions(id) ON DELETE SET NULL,
  description text NOT NULL,
  url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnostic_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.diagnostic_meetings(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'rascunho',
  content jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.diagnostic_meetings (prospect_id);
CREATE INDEX ON public.diagnostic_questions (section_id);
CREATE INDEX ON public.diagnostic_answers (meeting_id);
CREATE INDEX ON public.diagnostic_notes (meeting_id);
CREATE INDEX ON public.diagnostic_evidence (meeting_id);
CREATE INDEX ON public.diagnostic_reports (meeting_id);

CREATE TRIGGER prospects_touch BEFORE UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER meetings_touch BEFORE UPDATE ON public.diagnostic_meetings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER answers_touch BEFORE UPDATE ON public.diagnostic_answers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['prospects','diagnostic_sections','diagnostic_meetings','diagnostic_questions','diagnostic_answers','diagnostic_notes','diagnostic_evidence','diagnostic_reports'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Staff full access" ON public.%I FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', t);
  END LOOP;
END $$;