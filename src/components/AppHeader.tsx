import Link from "next/link";
import { APP_NAME } from "@/lib/labels";

export function AppHeader({
  title,
  subtitle,
  backHref,
}: {
  title?: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
      <div className="flex items-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="mt-0.5 inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[var(--brand)]"
            aria-label="Volver"
          >
            ←
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-[var(--brand)] uppercase">
            {APP_NAME}
          </p>
          <h1 className="truncate text-xl font-bold text-[var(--text)]">
            {title ?? "Tu comunidad"}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
