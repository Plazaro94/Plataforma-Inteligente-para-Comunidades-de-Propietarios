import Link from "next/link";

const items = [
  { href: "/", label: "Inicio" },
  { href: "/incidencias", label: "Incidencias" },
  { href: "/incidencias/nueva", label: "Nueva" },
] as const;

export function BottomNav({ active }: { active: "inicio" | "incidencias" | "nueva" }) {
  return (
    <nav className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <ul className="grid grid-cols-3">
        {items.map((item) => {
          const isActive =
            (active === "inicio" && item.href === "/") ||
            (active === "incidencias" && item.href === "/incidencias") ||
            (active === "nueva" && item.href === "/incidencias/nueva");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-14 items-center justify-center text-sm font-semibold ${
                  isActive ? "text-[var(--brand)]" : "text-[var(--muted)]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
