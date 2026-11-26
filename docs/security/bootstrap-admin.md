# Bootstrap do primeiro administrador VEROS

O cadastro público não concede papel de administrador. Crie a conta autorizada em Supabase Authentication → Users e, depois, execute no SQL Editor:

```sql
insert into public.user_roles (user_id, role)
values ('UUID-DO-USUARIO-AUTORIZADO', 'admin')
on conflict (user_id, role) do nothing;
```

O primeiro acesso de um administrador exige configurar TOTP (Google Authenticator, Microsoft Authenticator ou compatível). A política do banco também exige AAL2 para ações de equipe realizadas por administradores; não basta ocultar telas no frontend.

Clientes devem ser associados a uma organização por `organization_memberships`, com papel `client_admin` ou `client_viewer`. Nunca conceda o papel interno `admin` a um cliente.
