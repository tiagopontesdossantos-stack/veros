-- VEROS Intelligence workspace modules: CRM, delivery, finance and metrics.
-- All internal operational records remain staff-only. Client-facing records are
-- explicitly published and scoped to the client's organization.

CREATE TABLE public.crm_pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

CREATE TABLE public.crm_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  probability numeric(5,2) NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  is_won boolean NOT NULL DEFAULT false,
  is_lost boolean NOT NULL DEFAULT false,
  UNIQUE (pipeline_id, name),
  CHECK (NOT (is_won AND is_lost))
);

CREATE TABLE public.crm_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  pipeline_id uuid NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE RESTRICT,
  stage_id uuid NOT NULL REFERENCES public.crm_stages(id) ON DELETE RESTRICT,
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE SET NULL,
  title text NOT NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  expected_close_date date,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text,
  lost_reason text,
  next_activity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_opportunities_org_stage_idx ON public.crm_opportunities (organization_id, stage_id);
CREATE INDEX crm_opportunities_close_date_idx ON public.crm_opportunities (expected_close_date);

CREATE TABLE public.crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
  project_id uuid,
  title text NOT NULL,
  description text,
  activity_type text NOT NULL DEFAULT 'task' CHECK (activity_type IN ('task','call','meeting','email','follow_up')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  due_at timestamptz,
  completed_at timestamptz,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (prospect_id IS NOT NULL OR opportunity_id IS NOT NULL OR project_id IS NOT NULL)
);

CREATE TABLE public.client_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  client_organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  service_type text NOT NULL DEFAULT 'revops_diagnostic' CHECK (service_type IN ('revops_diagnostic','revops_implementation')),
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','in_progress','on_hold','completed','cancelled')),
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  start_date date,
  target_end_date date,
  completed_at timestamptz,
  client_visible boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (organization_id <> client_organization_id)
);
CREATE INDEX client_projects_client_org_idx ON public.client_projects (client_organization_id);

CREATE TABLE public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','blocked')),
  due_date date,
  position integer NOT NULL DEFAULT 0,
  client_visible boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.project_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  progress integer CHECK (progress BETWEEN 0 AND 100),
  client_visible boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_activities
  ADD CONSTRAINT crm_activities_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.client_projects(id) ON DELETE CASCADE;

CREATE TABLE public.finance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  project_id uuid REFERENCES public.client_projects(id) ON DELETE SET NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('income','expense')),
  category text NOT NULL,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  paid_at date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  payment_method text,
  reference_month date,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX finance_entries_org_due_idx ON public.finance_entries (organization_id, due_date);
CREATE INDEX finance_entries_status_idx ON public.finance_entries (status);

CREATE TABLE public.business_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  metric_key text NOT NULL,
  value numeric(16,2) NOT NULL,
  unit text NOT NULL DEFAULT 'number' CHECK (unit IN ('number','currency','percent','days')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  target numeric(16,2),
  notes text,
  client_visible boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (period_end >= period_start)
);
CREATE INDEX business_metrics_org_period_idx ON public.business_metrics (organization_id, period_start DESC);

CREATE TABLE public.commercial_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  title text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('revops_diagnostic','revops_implementation','custom')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  valid_until date,
  scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  terms text,
  sent_at timestamptz,
  decided_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  meeting_id uuid REFERENCES public.diagnostic_meetings(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.client_projects(id) ON DELETE CASCADE,
  frequency text NOT NULL CHECK (frequency IN ('weekly','monthly','quarterly','custom')),
  next_run_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (meeting_id IS NOT NULL OR project_id IS NOT NULL)
);

CREATE OR REPLACE FUNCTION public.touch_workspace_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'crm_opportunities','crm_activities','client_projects','project_milestones',
    'finance_entries','business_metrics','commercial_proposals'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_workspace_updated_at()', t || '_touch', t);
  END LOOP;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'crm_pipelines','crm_stages','crm_opportunities','crm_activities',
    'client_projects','project_milestones','project_updates','finance_entries',
    'business_metrics','commercial_proposals','report_schedules'
  ] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', 'Staff manage ' || t, t);
  END LOOP;
END $$;

-- Client accounts receive read-only access only to records explicitly published
-- by VEROS and scoped to their own organization.
CREATE POLICY "Clients read published projects" ON public.client_projects
  FOR SELECT TO authenticated USING (
    client_visible = true AND public.is_org_member(client_organization_id, auth.uid())
  );
CREATE POLICY "Clients read published milestones" ON public.project_milestones
  FOR SELECT TO authenticated USING (
    client_visible = true AND EXISTS (
      SELECT 1 FROM public.client_projects p
      WHERE p.id = project_id AND p.client_visible = true
        AND public.is_org_member(p.client_organization_id, auth.uid())
    )
  );
CREATE POLICY "Clients read published project updates" ON public.project_updates
  FOR SELECT TO authenticated USING (
    client_visible = true AND EXISTS (
      SELECT 1 FROM public.client_projects p
      WHERE p.id = project_id AND p.client_visible = true
        AND public.is_org_member(p.client_organization_id, auth.uid())
    )
  );
CREATE POLICY "Clients read published metrics" ON public.business_metrics
  FOR SELECT TO authenticated USING (
    client_visible = true AND public.is_org_member(organization_id, auth.uid())
  );

CREATE INDEX crm_activities_due_idx ON public.crm_activities (due_at) WHERE status = 'pending';
CREATE INDEX project_milestones_due_idx ON public.project_milestones (due_date) WHERE status <> 'completed';
