-- Seed the internal VEROS sales pipeline used by the CRM workspace.
WITH internal_org AS (
  SELECT id FROM public.organizations WHERE slug = 'veros-internal'
), inserted_pipeline AS (
  INSERT INTO public.crm_pipelines (organization_id, name, is_default)
  SELECT id, 'Pipeline comercial VEROS', true FROM internal_org
  ON CONFLICT (organization_id, name) DO UPDATE SET is_default = true
  RETURNING id
)
INSERT INTO public.crm_stages (pipeline_id, name, position, probability, is_won, is_lost)
SELECT p.id, s.name, s.position, s.probability, s.is_won, s.is_lost
FROM inserted_pipeline p
CROSS JOIN (VALUES
  ('Lead recebido', 1, 10::numeric, false, false),
  ('Qualificação', 2, 20::numeric, false, false),
  ('Diagnóstico RevOps', 3, 40::numeric, false, false),
  ('Proposta enviada', 4, 60::numeric, false, false),
  ('Negociação', 5, 80::numeric, false, false),
  ('Ganho', 6, 100::numeric, true, false),
  ('Perdido', 7, 0::numeric, false, true)
) AS s(name, position, probability, is_won, is_lost)
ON CONFLICT (pipeline_id, name) DO UPDATE SET
  position = EXCLUDED.position,
  probability = EXCLUDED.probability,
  is_won = EXCLUDED.is_won,
  is_lost = EXCLUDED.is_lost;
