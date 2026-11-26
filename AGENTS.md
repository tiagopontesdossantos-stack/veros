<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Landing sections live in `src/components/site/` and `src/routes/index.tsx`; form validation schema in `src/lib/diagnostic-schema.ts` is shared by client and server so rules stay in one place.
- Diagnostic form inserts via a public server function using the publishable key; the table allows anon INSERT only (no reads) so leads can't be exposed.
- VEROS Admin lives under `src/routes/_authenticated/admin.*` (client-only gate, sign-in at `/auth`); access requires a role in `user_roles` (admin/consultant) checked by `is_staff()` in RLS, so data stays private even if the UI is bypassed.
- First account ever created gets `admin` via the `assign_first_admin` trigger; later accounts need a role granted manually.
- Diagnostic answers upsert on `(meeting_id, question_id)` to avoid duplicates; complementary questions use `diagnostic_questions.meeting_id`, template questions have it null.
