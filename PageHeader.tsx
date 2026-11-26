import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string | undefined; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

export const adminHead = (title: string) => () => ({
  meta: [
    { title: `${title} | VEROS Admin` },
    { name: "description", content: "Ambiente interno da Veros Advisory." },
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: `${title} | VEROS Admin` },
    { property: "og:description", content: "Ambiente interno da Veros Advisory." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
