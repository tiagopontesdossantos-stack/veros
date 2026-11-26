-- VEROS Intelligence: organization isolation, safe role bootstrap and audit foundation.
-- Existing prospects remain owned by the internal VEROS organization.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_member_role') THEN
    CREATE TYPE public.organization_member_role AS ENUM ('client_admin', 'client_viewer');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  organization_type text NOT NULL DEFAULT 'client' CHECK (organization_type IN ('internal', 'client')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.organizations (name, slug, organization_type)
VALUES ('VEROS Advisory', 'veros-internal', 'internal')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.organization_member_role NOT NULL DEFAULT 'client_viewer',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS organization_memberships_user_id_idx ON public.organization_memberships (user_id);
CREATE INDEX IF NOT EXISTS organization_memberships_organization_id_idx ON public.organization_memberships (organization_id);

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS organization_id uuid;
UPDATE public.prospects
SET organization_id = (SELECT id FROM public.organizations WHERE slug = 'veros-internal')
WHERE organization_id IS NULL;
ALTER TABLE public.prospects ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.prospects
  ADD CONSTRAINT prospects_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS prospects_organization_id_idx ON public.prospects (organization_id);

-- A first public signup must never become a VEROS administrator automatically.
DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;
DROP FUNCTION IF EXISTS public.assign_first_admin();
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_org_member(_organization_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_memberships m
    JOIN public.organizations o ON o.id = m.organization_id
    WHERE m.organization_id = _organization_id AND m.user_id = _user_id AND o.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_org_members(_organization_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_staff(_user_id) OR EXISTS (
    SELECT 1 FROM public.organization_memberships m
    JOIN public.organizations o ON o.id = m.organization_id
    WHERE m.organization_id = _organization_id AND m.user_id = _user_id
      AND m.role = 'client_admin' AND o.organization_type = 'client' AND o.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_read_published_report(_meeting_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.diagnostic_reports r
    JOIN public.diagnostic_meetings m ON m.id = r.meeting_id
    JOIN public.prospects p ON p.id = m.prospect_id
    JOIN public.organization_memberships om ON om.organization_id = p.organization_id
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE r.meeting_id = _meeting_id AND r.status = 'publicado'
      AND om.user_id = _user_id AND o.status = 'active'
  );
$$;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_memberships TO authenticated;
GRANT ALL ON public.organizations, public.organization_memberships TO service_role;

DROP POLICY IF EXISTS "Staff manage organizations" ON public.organizations;
CREATE POLICY "Staff manage organizations" ON public.organizations FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Members read their organizations" ON public.organizations;
CREATE POLICY "Members read their organizations" ON public.organizations FOR SELECT TO authenticated
  USING (public.is_org_member(id, auth.uid()));

DROP POLICY IF EXISTS "Members read own organization memberships" ON public.organization_memberships;
CREATE POLICY "Members read own organization memberships" ON public.organization_memberships FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id, auth.uid()));
DROP POLICY IF EXISTS "Client admins add viewers" ON public.organization_memberships;
CREATE POLICY "Client admins add viewers" ON public.organization_memberships FOR INSERT TO authenticated
  WITH CHECK (
    role = 'client_viewer' AND public.can_manage_org_members(organization_id, auth.uid())
    AND EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.organization_type = 'client')
  );
DROP POLICY IF EXISTS "Client admins update viewers" ON public.organization_memberships;
CREATE POLICY "Client admins update viewers" ON public.organization_memberships FOR UPDATE TO authenticated
  USING (role = 'client_viewer' AND public.can_manage_org_members(organization_id, auth.uid()))
  WITH CHECK (role = 'client_viewer' AND public.can_manage_org_members(organization_id, auth.uid()));
DROP POLICY IF EXISTS "Client admins remove viewers" ON public.organization_memberships;
CREATE POLICY "Client admins remove viewers" ON public.organization_memberships FOR DELETE TO authenticated
  USING (role = 'client_viewer' AND public.can_manage_org_members(organization_id, auth.uid()));

-- The client portal can read only published report records. Internal notes, answers,
-- evidence and prospect/meeting source tables remain staff-only.
DROP POLICY IF EXISTS "Members read published prospect identity" ON public.prospects;
DROP POLICY IF EXISTS "Members read published meetings" ON public.diagnostic_meetings;
DROP POLICY IF EXISTS "Members read published reports" ON public.diagnostic_reports;
CREATE POLICY "Members read published reports" ON public.diagnostic_reports FOR SELECT TO authenticated
  USING (status = 'publicado' AND public.can_read_published_report(meeting_id, auth.uid()));

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id uuid,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name text NOT NULL,
  record_id text,
  before_data jsonb,
  after_data jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_occurred_at_idx ON public.audit_logs (occurred_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_user_id_idx ON public.audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_table_record_idx ON public.audit_logs (table_name, record_id);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
DROP POLICY IF EXISTS "Staff read audit logs" ON public.audit_logs;
CREATE POLICY "Staff read audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.capture_audit_log()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_row jsonb; new_row jsonb; row_id text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_row := to_jsonb(NEW); row_id := new_row ->> 'id';
  ELSIF TG_OP = 'UPDATE' THEN
    old_row := to_jsonb(OLD); new_row := to_jsonb(NEW); row_id := new_row ->> 'id';
  ELSE
    old_row := to_jsonb(OLD); row_id := old_row ->> 'id';
  END IF;
  INSERT INTO public.audit_logs (actor_user_id, action, table_name, record_id, before_data, after_data)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, row_id, old_row, new_row);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
DROP TRIGGER IF EXISTS audit_organizations ON public.organizations;
CREATE TRIGGER audit_organizations AFTER INSERT OR UPDATE OR DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
DROP TRIGGER IF EXISTS audit_organization_memberships ON public.organization_memberships;
CREATE TRIGGER audit_organization_memberships AFTER INSERT OR UPDATE OR DELETE ON public.organization_memberships
  FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
DROP TRIGGER IF EXISTS audit_prospects ON public.prospects;
CREATE TRIGGER audit_prospects AFTER INSERT OR UPDATE OR DELETE ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
DROP TRIGGER IF EXISTS audit_diagnostic_meetings ON public.diagnostic_meetings;
CREATE TRIGGER audit_diagnostic_meetings AFTER INSERT OR UPDATE OR DELETE ON public.diagnostic_meetings
  FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
DROP TRIGGER IF EXISTS audit_diagnostic_answers ON public.diagnostic_answers;
CREATE TRIGGER audit_diagnostic_answers AFTER INSERT OR UPDATE OR DELETE ON public.diagnostic_answers
  FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
DROP TRIGGER IF EXISTS audit_diagnostic_notes ON public.diagnostic_notes;
CREATE TRIGGER audit_diagnostic_notes AFTER INSERT OR UPDATE OR DELETE ON public.diagnostic_notes
  FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
DROP TRIGGER IF EXISTS audit_diagnostic_evidence ON public.diagnostic_evidence;
CREATE TRIGGER audit_diagnostic_evidence AFTER INSERT OR UPDATE OR DELETE ON public.diagnostic_evidence
  FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();
DROP TRIGGER IF EXISTS audit_diagnostic_reports ON public.diagnostic_reports;
CREATE TRIGGER audit_diagnostic_reports AFTER INSERT OR UPDATE OR DELETE ON public.diagnostic_reports
  FOR EACH ROW EXECUTE FUNCTION public.capture_audit_log();

COMMENT ON TABLE public.organizations IS 'Tenant boundary for VEROS internal workspace and client organizations.';
COMMENT ON TABLE public.organization_memberships IS 'Client organization membership. Client admins can manage viewer memberships only.';
COMMENT ON TABLE public.audit_logs IS 'Append-only audit trail populated by database triggers; readable by VEROS staff only.';
