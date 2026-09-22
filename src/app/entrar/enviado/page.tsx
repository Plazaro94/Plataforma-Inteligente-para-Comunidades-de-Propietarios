import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { prisma } from "@/lib/db";

type PageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function EnviadoPage({ searchParams }: PageProps) {
  const { email } = await searchParams;
  const normalized = email?.trim().toLowerCase() ?? "";
  const showDevLink =
    !process.env.EMAIL_SERVER ||
    process.env.EMAIL_SERVER === "smtp://127.0.0.1:1025" ||
    process.env.NODE_ENV === "development";

  const magic =
    showDevLink && normalized
      ? await prisma.devMagicLink.findUnique({ where: { email: normalized } })
      : null;

  return (
    <>
      <AppHeader title="Revisa tu email" subtitle="Enlace de acceso enviado" />
      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Si <strong>{normalized || "tu email"}</strong> tiene acceso, usa el botón
          de abajo para entrar (aún no hay correo real configurado).
        </p>

        {magic?.url ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm font-semibold text-[var(--brand)]">
              Acceso directo (sin email configurado)
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Pulsa el botón. Tiene que recargar la página completa.
            </p>
            {/* Important: plain <a>, not next/link — Auth.js needs a full GET navigation */}
            <a
              href={magic.url}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-center text-sm font-bold text-white"
            >
              Abrir enlace mágico
            </a>
            <p className="mt-3 break-all text-xs text-[var(--muted)]">
              Si el botón no responde, copia y pega este enlace en el navegador:
              <br />
              <span className="text-[var(--text)]">{magic.url}</span>
            </p>
          </div>
        ) : (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            No encontramos un enlace reciente para este email. Vuelve a pedir acceso
            desde Entrar.
          </p>
        )}

        <Link href="/entrar" className="text-sm font-semibold text-[var(--brand)]">
          ← Volver
        </Link>
      </main>
    </>
  );
}
