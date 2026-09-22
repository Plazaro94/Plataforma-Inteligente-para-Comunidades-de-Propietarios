import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SinComunidadPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/entrar");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
  });
  if (membership) redirect("/");

  return (
    <>
      <AppHeader title="Sin comunidad" subtitle="Falta una invitación" />
      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Has entrado, pero todavía no perteneces a ninguna comunidad. Pide a
          quien gestiona la tuya que te envíe una invitación.
        </p>
        <Link href="/entrar" className="text-sm font-semibold text-[var(--brand)]">
          Probar con otro email
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/entrar" });
          }}
        >
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold"
          >
            Salir
          </button>
        </form>
      </main>
    </>
  );
}
