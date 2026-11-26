-- Require a second authentication factor for VEROS administrators at the database policy layer.
-- Consultants retain password-based access unless the organization enables MFA for them later.
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = 'consultant'
        OR (role = 'admin' AND COALESCE(auth.jwt() ->> 'aal', 'aal1') = 'aal2')
      )
  );
$$;

COMMENT ON FUNCTION public.is_staff(uuid) IS
  'Checks staff role. Admin requires Supabase AAL2; consultant currently requires a valid authenticated session.';
