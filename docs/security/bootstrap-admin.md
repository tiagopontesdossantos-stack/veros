# Bootstrap do primeiro administrador VEROS

O cadastro público cria apenas uma identidade Supabase. Ele não concede papel de administrador.

1. Crie a conta autorizada em Authentication → Users (ou use o cadastro normal e confirme o e-mail).
2. Copie o UUID do usuário autorizado.
3. No SQL Editor do projeto Supabase, execute o comando abaixo substituindo o UUID:

```sql
insert into public.user_roles (user_id, role)
values ('UUID-DO-USUARIO-AUTORIZADO', 'admin')
on conflict (user_id, role) do nothing;
```

Não conceda esse papel a clientes. Clientes devem ser associados a uma organização por `organization_memberships`, com papel `client_admin` ou `client_viewer`.

A migração 0003 remove o gatilho que promovia automaticamente a primeira conta registrada. Essa alteração impede que um visitante se torne administrador ao se cadastrar antes da equipe.
