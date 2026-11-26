import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAsset from "@/assets/veros-logo-dark.png.asset.json";

type MfaStage = "signin" | "challenge" | "enroll";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar | VEROS" },
      { name: "description", content: "Acesso seguro aos ambientes VEROS." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<MfaStage>("signin");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function continueAfterAuthentication() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Não foi possível validar sua sessão. Entre novamente.");
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);

    if (rolesError) {
      setError("Não foi possível validar suas permissões. Tente novamente.");
      return;
    }

    const isAdmin = roles.some((item) => item.role === "admin");
    if (!isAdmin) {
      if (roles.length === 0) {
        setError("Sua conta ainda não possui acesso liberado. Solicite autorização à VEROS.");
        return;
      }
      navigate({ to: "/admin" });
      return;
    }

    const { data: assurance, error: assuranceError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError) {
      setError("Não foi possível verificar a autenticação em duas etapas.");
      return;
    }
    if (assurance.currentLevel === "aal2") {
      navigate({ to: "/admin" });
      return;
    }

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setError("Não foi possível consultar os fatores de autenticação.");
      return;
    }

    const verifiedTotp = factors.totp.find((factor) => factor.status === "verified");
    if (verifiedTotp) {
      setFactorId(verifiedTotp.id);
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: verifiedTotp.id });
      if (challengeError) {
        setError("Não foi possível iniciar a verificação em duas etapas.");
        return;
      }
      setChallengeId(challenge.id);
      setStage("challenge");
      setInfo("Digite o código de 6 dígitos do seu aplicativo autenticador.");
      return;
    }

    const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "VEROS Admin",
    });
    if (enrollError) {
      setError("Não foi possível iniciar a configuração do autenticador.");
      return;
    }

    setFactorId(enrolled.id);
    setQrCode(enrolled.totp.qr_code);
    setSecret(enrolled.totp.secret);
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: enrolled.id });
    if (challengeError) {
      setError("O autenticador foi criado, mas não foi possível iniciar a verificação. Tente novamente.");
      return;
    }
    setChallengeId(challenge.id);
    setStage("enroll");
    setInfo("Configure o aplicativo autenticador e confirme o primeiro código para ativar a proteção.");
  }

  useEffect(() => {
    let active = true;
    async function resumeSession() {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (!active || !roles?.some((item) => item.role === "admin")) return;
      const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (active && assurance?.currentLevel !== "aal2") {
        setLoading(true);
        await continueAfterAuthentication();
        if (active) setLoading(false);
      }
    }
    void resumeSession();
    return () => { active = false; };
  }, []);

  async function submitSignIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError("E-mail ou senha inválidos, ou e-mail ainda não confirmado.");
      return;
    }
    await continueAfterAuthentication();
    setLoading(false);
  }

  async function submitMfa(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: code.trim(),
    });
    setLoading(false);
    if (verifyError) {
      setError("Código inválido ou expirado. Confira o aplicativo e tente novamente.");
      return;
    }
    navigate({ to: "/admin" });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStage("signin");
    setCode("");
    setFactorId("");
    setChallengeId("");
    setQrCode("");
    setSecret("");
    setInfo(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <form
        onSubmit={stage === "signin" ? submitSignIn : submitMfa}
        className="w-full max-w-sm rounded-2xl border bg-card p-8"
      >
        <img src={logoAsset.url} alt="Veros Advisory" className="mx-auto h-10 w-auto" />
        <h1 className="mt-6 text-center font-display text-xl font-semibold">
          {stage === "signin" ? "Acesso VEROS" : stage === "enroll" ? "Ative a autenticação em duas etapas" : "Confirme sua identidade"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {stage === "signin" ? "Ambiente seguro para equipe e clientes autorizados." : "A segurança da sua conta é necessária para continuar."}
        </p>

        {stage === "signin" ? (
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {stage === "enroll" && (
              <div className="space-y-3 rounded-lg border bg-background p-4">
                {qrCode && <img src={qrCode} alt="QR Code para configurar o aplicativo autenticador" className="mx-auto h-48 w-48" />}
                <p className="text-sm text-muted-foreground">Escaneie o QR Code com Google Authenticator, Microsoft Authenticator ou outro aplicativo compatível.</p>
                <div className="space-y-1">
                  <Label htmlFor="secret">Chave de configuração manual</Label>
                  <Input id="secret" readOnly value={secret} />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="mfa-code">Código de autenticação</Label>
              <Input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" />
            </div>
          </div>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        {info && <p className="mt-4 text-sm text-muted-foreground">{info}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={loading || (stage !== "signin" && code.length !== 6)}>
          {loading ? "Aguarde…" : stage === "signin" ? "Entrar" : stage === "enroll" ? "Ativar proteção e entrar" : "Verificar e entrar"}
        </Button>
        {stage !== "signin" && (
          <button type="button" className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={signOut}>
            Sair e trocar de conta
          </button>
        )}
      </form>
    </div>
  );
}
