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
          Si <strong>{normalized || "tu email"}</strong> tiene acceso, verás un
          enlace para entrar. En el móvil suele llegar en segundos.
        </p>

        {magic?.url ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm font-semibold text-[var(--brand)]">
              Acceso directo (sin email configurado)
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Todavía no hay servidor de correo. Usa este enlace para entrar:
            </p>
            <Link
              href={magic.url}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-center text-sm font-bold text-white"
            >
              Abrir enlace mágico
            </Link>
          </div>
        ) : null}

        <Link href="/entrar" className="text-sm font-semibold text-[var(--brand)]">
          ← Volver
        </Link>
      </main>
    </>
  );
}
