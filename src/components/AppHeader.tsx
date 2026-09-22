import Link from "next/link";
import { APP_NAME } from "@/lib/labels";
import { SignOutButton } from "@/components/SignOutButton";

export function AppHeader({
  title,
  subtitle,
  backHref,
  showSignOut = false,
}: {
  title?: string;
  subtitle?: string;
  backHref?: string;
  showSignOut?: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
      <div className="flex items-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="mt-0.5 inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[#0f766e]"
            aria-label="Volver"
          >
            ←
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-[#0f766e] uppercase">
            {APP_NAME}
          </p>
          <h1 className="truncate text-xl font-bold text-[var(--text)]">
            {title ?? "Tu comunidad"}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
        {showSignOut ? <SignOutButton /> : null}
      </div>
    </header>
  );
}
