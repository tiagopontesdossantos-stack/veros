import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Menu, X, Check, ChevronDown, MessageCircle, Instagram, Linkedin, Phone, ArrowRight,
  TrendingDown, Unplug, Workflow, Coins, Gauge, UserMinus, Megaphone, Target, HeartHandshake, BrainCircuit, Search, Rocket,
} from "lucide-react";

import logoAsset from "../assets/veros-logo-dark.png.asset.json";
import tiagoAsset from "../assets/tiago-pontes.jpg.asset.json";
import tiagoPalcoAsset from "../assets/tiago-pontes-palco.jpg.asset.json";
import tiagoVideoAsset from "../assets/tiago-pontes-video.mp4.asset.json";
import palestraAsset from "../assets/tiago-pontes-palestra.mp4.asset.json";
import palestraCapaAsset from "../assets/tiago-pontes-palestra-capa.jpg.asset.json";
import { DemoDashboard, PlatformPreview, MODULES } from "@/components/site/DemoDashboard";
import { DiagnosticForm } from "@/components/site/DiagnosticForm";

const WHATSAPP_URL =
  "https://wa.me/5594992179773?text=Olá!%20Vim%20pelo%20site%20da%20Veros%20Advisory%20e%20quero%20agendar%20um%20diagnóstico.";
const INSTAGRAM_URL = "https://www.instagram.com/tiagophontes/";
const LINKEDIN_URL = "https://www.linkedin.com/in/tiago-pontes-569807353";

const TITLE = "Veros Advisory | Revenue Operations & Growth Advisory";
const DESC =
  "Consultoria de Revenue Operations: conectamos marketing, vendas, Customer Success, processos e tecnologia para transformar operações comerciais em sistemas previsíveis de crescimento.";

const NAV = [
  { label: "Soluções", href: "#solucoes" },
  { label: "Metodologia", href: "#metodologia" },
  { label: "Para quem", href: "#para-quem" },
  { label: "Sobre", href: "#sobre" },
];

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Veros Advisory",
          description: DESC,
          slogan: "Transformamos operações comerciais em sistemas previsíveis de crescimento.",
          telephone: "+55 94 99217-9773",
          areaServed: "BR",
          founder: { "@type": "Person", name: "Tiago Pontes" },
          sameAs: [INSTAGRAM_URL, LINKEDIN_URL],
          knowsAbout: ["Revenue Operations", "Revenue Intelligence", "Growth Advisory"],
        }),
      },
    ],
  }),
});

/* ---------- helpers ---------- */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-visible"), io.unobserve(e.target))),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Section({ id, alt, children, className = "" }: { id?: string; alt?: boolean; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-20 py-20 sm:py-28 ${alt ? "bg-section" : ""} ${className}`}>
      <div className="mx-auto max-w-6xl px-5">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan">{children}</p>;
}

function PrimaryCta({ children, onClick, className = "" }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 hover:glow-primary ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </button>
  );
}

function WhatsLink({ className = "", label = "Conversar no WhatsApp" }: { className?: string; label?: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold transition hover:border-performance hover:text-performance ${className}`}
    >
      <MessageCircle className="h-4 w-4" aria-hidden /> {label}
    </a>
  );
}

/* ---------- page ---------- */

function Index() {
  const [source, setSource] = useState("site");
  useReveal();
  const openForm = (src: string) => {
    setSource(src);
    document.getElementById("diagnostico")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground md:pb-0">
      <Header onCta={() => openForm("header")} />
      <main>
        <Hero onCta={() => openForm("hero")} />
        <Problem />
        <RevOps />
        <Solutions onCta={openForm} />
        <Methodology />
        <Platform onCta={() => openForm("plataforma")} />
        <Audience onCta={() => openForm("para-quem")} />
        <About />
        <Faq />
        <FinalCta source={source} />
      </main>
      <Footer />
      <StickyCtas onCta={() => openForm("barra-fixa")} />
    </div>
  );
}

function Header({ onCta }: { onCta: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-border bg-background/90 backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#topo" aria-label="Veros Advisory — início">
          <img src={logoAsset.url} alt="Veros Advisory" className="h-10 w-auto" />
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-muted-foreground transition hover:text-foreground">
              {n.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onCta}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Agendar diagnóstico
          </button>
        </nav>
        <button
          type="button"
          className="rounded-md p-2 md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border px-5 py-4 md:hidden" aria-label="Menu móvel">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block py-3 text-base text-muted-foreground">
              {n.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => { setOpen(false); onCta(); }}
            className="mt-3 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            Agendar diagnóstico
          </button>
        </nav>
      )}
    </header>
  );
}

function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section id="topo" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_1fr]">
        <div className="reveal">
          <Eyebrow>Revenue Operations & Growth Advisory</Eyebrow>
          <h1 className="text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
            Sua operação gera receita. <span className="text-cyan">Mas ela está preparada para crescer?</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Conectamos marketing, vendas, Customer Success, processos e tecnologia para transformar operações comerciais em
            sistemas previsíveis de crescimento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryCta onClick={onCta}>Solicitar diagnóstico de receita</PrimaryCta>
            <a
              href="#metodologia"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-semibold transition hover:border-cyan hover:text-cyan"
            >
              Conhecer nossa metodologia
            </a>
          </div>
        </div>
        <div className="reveal">
          <DemoDashboard />
        </div>
      </div>
    </section>
  );
}

const PROBLEMS = [
  { icon: TrendingDown, t: "Falta de previsibilidade de receita" },
  { icon: Unplug, t: "Marketing e vendas desconectados" },
  { icon: Workflow, t: "Processos comerciais desestruturados" },
  { icon: Coins, t: "Alto custo de aquisição de clientes" },
  { icon: Gauge, t: "Falta de indicadores confiáveis" },
  { icon: UserMinus, t: "Baixa retenção e perda de receita recorrente" },
];

function Problem() {
  return (
    <Section alt>
      <div className="reveal max-w-3xl">
        <Eyebrow>O problema</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">O crescimento não deveria depender de achismos.</h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Muitas empresas investem em marketing, ampliam suas equipes comerciais e conquistam novos clientes, mas continuam
          sem compreender exatamente como sua receita é gerada, onde oportunidades são perdidas e quais fatores limitam seu
          crescimento.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROBLEMS.map(({ icon: Icon, t }, i) => (
          <div key={t} className="reveal flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition hover:border-cyan/40">
            <span className="font-display text-sm font-semibold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <Icon className="mb-3 h-5 w-5 text-cyan" aria-hidden />
              <p className="font-semibold">{t}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="reveal mt-12 border-l-2 border-primary pl-5 text-xl font-semibold">
        O problema nem sempre está na falta de investimento. Muitas vezes, está na forma como a operação funciona.
      </p>
    </Section>
  );
}

const PILLARS = [
  { icon: Megaphone, t: "Marketing Operations", items: ["Aquisição", "Geração de demanda", "Qualificação", "CAC", "Origem dos leads"] },
  { icon: Target, t: "Sales Operations", items: ["CRM", "Pipeline", "Conversão", "Produtividade", "Forecast"] },
  { icon: HeartHandshake, t: "Customer Success Operations", items: ["Onboarding", "Retenção", "Churn", "Expansão", "LTV"] },
  { icon: BrainCircuit, t: "Revenue Intelligence", items: ["Dados", "Indicadores", "Dashboards", "Previsibilidade", "Tomada de decisão"] },
];

function RevOps() {
  return (
    <Section id="revops">
      <div className="reveal mx-auto max-w-3xl text-center">
        <Eyebrow>O que é RevOps</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">Uma operação. Uma estratégia. Uma visão integrada de receita.</h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Revenue Operations é a forma de gerir marketing, vendas e Customer Success como um único sistema de receita: os
          mesmos dados, os mesmos indicadores e processos que conversam entre si, do primeiro contato à renovação.
        </p>
      </div>
      <div className="relative mt-14">
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-px w-[80%] -translate-x-1/2 bg-border lg:block" aria-hidden />
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, t, items }) => (
            <div key={t} className="reveal rounded-xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-cyan" aria-hidden />
              <h3 className="mt-4 text-sm font-bold uppercase tracking-wider">{t}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {items.map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-cyan" aria-hidden /> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="reveal mx-auto mt-6 flex max-w-xl flex-col items-center rounded-xl border border-primary/40 bg-primary/10 px-6 py-5 text-center">
          <p className="font-display text-lg font-semibold">Veros Advisory</p>
          <p className="mt-1 text-sm text-muted-foreground">Integração por meio de processos, tecnologia e inteligência de dados.</p>
        </div>
      </div>
    </Section>
  );
}

const SOLUTIONS = [
  {
    code: "01", name: "Veros Revenue Audit", category: "Diagnóstico estratégico de receita", featured: false, icon: Search,
    desc: "Diagnóstico aprofundado da operação de receita da empresa, utilizando a metodologia RevOps para identificar gargalos, oportunidades e pontos de melhoria na integração entre marketing, vendas e Customer Success.",
    cta: "Solicitar o diagnóstico", src: "solucao-audit",
    items: ["Diagnóstico de marketing e geração de demanda.", "Análise de processos comerciais e pipeline.", "Avaliação de CRM e ferramentas utilizadas.", "Análise de indicadores e taxas de conversão.", "Avaliação de Customer Success e retenção.", "Identificação de gargalos operacionais.", "Plano estratégico de melhorias e prioridades."],
    delivery: "Diagnóstico da operação de receita e plano de ação estratégico.",
  },
  {
    code: "02", name: "Veros Revenue Growth", category: "Consultoria completa de RevOps", featured: true, icon: Rocket,
    desc: "Uma atuação completa que começa com o diagnóstico da operação e avança para a estruturação, implementação e acompanhamento das melhorias necessárias para tornar a operação de receita mais eficiente, integrada e previsível.",
    cta: "Estruturar minha operação", src: "solucao-growth",
    items: ["Tudo o que está incluído no Revenue Audit.", "Estruturação de processos de marketing, vendas e Customer Success.", "Implementação e organização de CRM.", "Estruturação de pipeline e processos comerciais.", "Definição de KPIs e dashboards gerenciais.", "Automações e integração de ferramentas.", "Treinamento e alinhamento das equipes.", "Acompanhamento de indicadores e planos de ação.", "Otimização contínua da operação."],
    delivery: "Estruturação e implementação de melhorias, com acompanhamento da evolução da operação.",
  },
];

function Solutions({ onCta }: { onCta: (src: string) => void }) {
  return (
    <Section id="solucoes" alt>
      <div className="reveal max-w-3xl">
        <Eyebrow>Soluções Veros</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">Do diagnóstico à implementação.</h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Estruturamos operações de receita para empresas que buscam eficiência, integração e crescimento previsível.
        </p>
      </div>
      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[1fr_1.15fr]">
        {SOLUTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={s.code}
              className={
                "reveal relative flex flex-col rounded-2xl border p-7 transition hover:-translate-y-0.5 sm:p-8 " +
                (s.featured ? "border-primary/70 bg-navy glow-primary" : "border-border bg-card hover:border-primary/60")
              }
            >
              {s.featured && (
                <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Solução mais completa
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className={"flex h-10 w-10 items-center justify-center rounded-lg border " + (s.featured ? "border-primary/50 bg-primary/15 text-cyan" : "border-border bg-background/50 text-cyan")}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-xs font-semibold uppercase tracking-wider text-cyan">{s.category}</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold">{s.name}</h3>
              <p className="mt-3 text-muted-foreground">{s.desc}</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Escopo</p>
              <ul className="mt-3 flex-1 space-y-2.5 text-sm">
                {s.items.map((it) => (
                  <li key={it} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-performance" aria-hidden /> {it}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-border bg-background/40 p-4 text-sm">
                <span className="font-semibold text-foreground">Entrega: </span>
                <span className="text-muted-foreground">{s.delivery}</span>
              </div>
              <button
                type="button"
                onClick={() => onCta(s.src)}
                className={
                  "mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition " +
                  (s.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground")
                }
              >
                {s.cta} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

const STEPS = [
  ["Diagnostic", "Mapeamento completo da operação atual."],
  ["Strategy", "Definição de prioridades e planejamento."],
  ["Structure", "Desenho dos processos e responsabilidades."],
  ["Integration", "Integração de ferramentas, departamentos e dados."],
  ["Intelligence", "Implementação de indicadores e dashboards."],
  ["Optimization", "Acompanhamento, análise e evolução contínua."],
];

function Methodology() {
  return (
    <Section id="metodologia">
      <div className="reveal max-w-3xl">
        <Eyebrow>Metodologia Veros</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">Do diagnóstico à previsibilidade de receita.</h2>
        <p className="mt-5 text-lg text-muted-foreground">Uma metodologia própria, desenvolvida pela Veros Advisory, em seis etapas.</p>
      </div>
      <ol className="relative mt-14 grid gap-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        <div className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-primary via-cyan to-performance lg:block" aria-hidden />
        {STEPS.map(([t, d], i) => (
          <li key={t} className="reveal relative">
            <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-cyan/50 bg-background font-display text-sm font-semibold text-cyan">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-sm font-bold uppercase tracking-wider">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Platform({ onCta }: { onCta: () => void }) {
  return (
    <Section id="plataforma" alt>
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="reveal">
          <Eyebrow>Plataforma e tecnologia · Em desenvolvimento</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">Inteligência de receita precisa estar disponível para quem toma decisões.</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            A Veros está desenvolvendo uma estrutura proprietária de Revenue Intelligence para centralizar diagnósticos,
            indicadores, planos de ação e acompanhamento da evolução operacional de seus clientes.
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Módulos previstos</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MODULES.map((m) => (
              <span key={m} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{m}</span>
            ))}
          </div>
          <PrimaryCta onClick={onCta} className="mt-8">Conheça nossa abordagem tecnológica</PrimaryCta>
        </div>
        <div className="reveal">
          <PlatformPreview />
          <p className="mt-3 text-center text-xs text-muted-foreground">Prévia conceitual. A plataforma ainda não está disponível.</p>
        </div>
      </div>
    </Section>
  );
}

const SEGMENTS_LIST = [
  "Agências de marketing e publicidade",
  "Empresas SaaS e startups",
  "Empresas de tecnologia",
  "Empresas de serviços B2B",
  "Negócios com equipes comerciais estruturadas",
];

function Audience({ onCta }: { onCta: () => void }) {
  return (
    <Section id="para-quem">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="reveal">
          <Eyebrow>Para quem é a Veros</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">Empresas que precisam crescer com inteligência operacional.</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Empresas que já possuem operação de marketing e vendas, investem em aquisição de clientes e precisam melhorar
            sua eficiência, previsibilidade e rentabilidade.
          </p>
          <PrimaryCta onClick={onCta} className="mt-8">Solicitar diagnóstico de receita</PrimaryCta>
        </div>
        <ul className="reveal grid gap-3">
          {SEGMENTS_LIST.map((s) => (
            <li key={s} className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
              <Check className="h-5 w-5 shrink-0 text-performance" aria-hidden />
              <span className="font-semibold">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function About() {
  return (
    <Section id="sobre" alt>
      <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal grid gap-3">
          <img src={tiagoAsset.url} alt="Tiago Pontes, fundador da Veros Advisory" className="aspect-[4/5] w-full rounded-2xl border border-border object-cover" loading="lazy" />
          <div className="grid grid-cols-2 gap-3">
            <img src={tiagoPalcoAsset.url} alt="Tiago Pontes palestrando" className="aspect-square w-full rounded-xl border border-border object-cover" loading="lazy" />
            <video src={tiagoVideoAsset.url} className="aspect-square w-full rounded-xl border border-border object-cover" muted loop playsInline autoPlay preload="metadata" aria-label="Vídeo de Tiago Pontes" />
          </div>
          <video src={palestraAsset.url} poster={palestraCapaAsset.url} controls playsInline preload="none" className="mx-auto aspect-[9/16] w-full max-w-sm rounded-2xl border border-border bg-navy object-cover" aria-label="Vídeo de Tiago Pontes palestrando" />
        </div>
        <div className="reveal">
          <Eyebrow>Sobre a Veros</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">Estratégia de negócios com visão operacional.</h2>
          <div className="mt-6 space-y-4 text-lg text-muted-foreground">
            <p className="text-foreground">Sou Tiago Pontes, fundador da Veros Advisory.</p>
            <p>Minha trajetória profissional foi construída na linha de frente de marketing, vendas e gestão comercial, atuando em operações B2C e B2B, em diferentes segmentos de mercado.</p>
            <p>Ao longo dessa experiência, identifiquei um problema recorrente: empresas investem para crescer, mas nem sempre possuem processos, indicadores e integração suficientes para transformar investimento em receita previsível.</p>
            <p>A Veros nasce dessa visão: conectar estratégia, processos, tecnologia e inteligência para ajudar empresas a compreender, estruturar e otimizar suas operações de receita.</p>
            <p className="border-l-2 border-cyan pl-4 text-foreground">Acreditamos que crescimento sustentável não acontece por acaso. Ele é construído com dados, processos e decisões bem fundamentadas.</p>
          </div>
          <div className="mt-8 flex gap-3">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de Tiago Pontes" className="rounded-lg border border-border p-2.5 transition hover:border-cyan hover:text-cyan"><Linkedin className="h-5 w-5" /></a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Tiago Pontes" className="rounded-lg border border-border p-2.5 transition hover:border-cyan hover:text-cyan"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </Section>
  );
}

const FAQS = [
  ["O que é Revenue Operations?", "É a gestão integrada de marketing, vendas e Customer Success como um único sistema de receita, com processos, dados e indicadores compartilhados. O objetivo é dar previsibilidade e eficiência ao crescimento."],
  ["Qual a diferença entre RevOps e consultoria comercial?", "A consultoria comercial costuma olhar apenas para vendas. RevOps analisa toda a jornada de receita — da aquisição à retenção — e as conexões entre áreas, ferramentas e dados."],
  ["Minha empresa precisa ter CRM para contratar a Veros?", "Não. Se já houver um CRM, avaliamos o uso atual. Se não houver, a implementação do CRM faz parte do Revenue Growth."],
  ["A Veros implementa processos e ferramentas?", "Sim. No Revenue Growth estruturamos processos, implementamos e organizamos o CRM e o pipeline, definimos KPIs e dashboards, integramos ferramentas e treinamos as equipes."],
  ["A consultoria atende empresas de quais segmentos?", "Agências de marketing e publicidade, empresas SaaS e startups, empresas de tecnologia, serviços B2B e negócios com equipes comerciais estruturadas."],
  ["Como funciona o Revenue Audit?", "É um diagnóstico estratégico: analisamos aquisição, operação comercial, Customer Success, processos e indicadores, identificamos gargalos e entregamos um plano estratégico de evolução."],
  ["A Veros acompanha a operação depois da implementação?", "Sim. No Revenue Growth, o acompanhamento de indicadores e planos de ação e a otimização contínua da operação fazem parte do escopo."],
  ["Como iniciar um projeto?", "Preencha o formulário de diagnóstico ou fale conosco pelo WhatsApp. Agendamos uma conversa inicial para entender o momento da sua operação."],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq">
      <div className="reveal mx-auto max-w-3xl">
        <Eyebrow>Perguntas frequentes</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">Dúvidas sobre RevOps e a Veros.</h2>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
          {FAQS.map(([q, a], i) => (
            <div key={q}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold"
                aria-expanded={open === i}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {q}
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {open === i && (
                <p id={`faq-${i}`} className="px-6 pb-5 text-muted-foreground">{a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function FinalCta({ source }: { source: string }) {
  return (
    <Section id="diagnostico" alt className="relative overflow-hidden">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="reveal lg:sticky lg:top-28">
          <Eyebrow>Diagnóstico estratégico</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">Sua empresa está crescendo. Sua operação está acompanhando?</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Descubra como integrar processos, tecnologia e inteligência para construir uma operação de receita mais
            eficiente e previsível.
          </p>
          <div className="mt-8"><WhatsLink label="Prefiro falar pelo WhatsApp" /></div>
        </div>
        <div className="reveal"><DiagnosticForm source={source} /></div>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3">
        <div>
          <img src={logoAsset.url} alt="Veros Advisory" className="h-9 w-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Revenue Operations & Growth Advisory.</p>
        </div>
        <nav aria-label="Rodapé" className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <a href="#solucoes" className="hover:text-foreground">Soluções</a>
          <a href="#metodologia" className="hover:text-foreground">Metodologia</a>
          <a href="#sobre" className="hover:text-foreground">Sobre</a>
          <a href="#diagnostico" className="hover:text-foreground">Contato</a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">LinkedIn</a>
        </nav>
        <div className="space-y-3 text-sm text-muted-foreground">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground">
            <Phone className="h-4 w-4" aria-hidden /> (94) 99217-9773
          </a>
          <div className="flex gap-3">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-foreground"><Instagram className="h-5 w-5" /></a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <p className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Veros Advisory. Todos os direitos reservados.
      </p>
    </footer>
  );
}

function StickyCtas({ onCta }: { onCta: () => void }) {
  return (
    <>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-performance text-accent-foreground transition hover:scale-105 md:flex"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-border bg-background/95 p-2.5 backdrop-blur md:hidden">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-semibold">
          <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
        </a>
        <button type="button" onClick={onCta} className="rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground">
          Agendar diagnóstico
        </button>
      </div>
    </>
  );
}
