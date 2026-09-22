import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { prisma } from "@/lib/db";
import { canManageInvites, requireMembership } from "@/lib/session";
import { createProvider } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  const { membership, community } = await requireMembership();
  const canEdit = canManageInvites(membership.role);

  const providers = await prisma.provider.findMany({
    where: { communityId: community.id },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { expedientes: true } },
    },
  });

  return (
    <>
      <AppHeader
        title="Proveedores"
        subtitle="Fichas sin cuenta. Las actuaciones quedan en la comunidad."
        backHref="/"
      />
      <main className="flex flex-1 flex-col gap-5 px-4 py-5">
        {canEdit ? (
          <form action={createProvider} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="text-base font-bold">Nuevo proveedor</h2>
            <input
              name="name"
              required
              placeholder="Nombre de la empresa"
              className="min-h-12 w-full rounded-xl border border-[var(--border)] px-3"
            />
            <input
              name="phone"
              placeholder="Teléfono"
              className="min-h-12 w-full rounded-xl border border-[var(--border)] px-3"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="min-h-12 w-full rounded-xl border border-[var(--border)] px-3"
            />
            <textarea
              name="notes"
              rows={2}
              placeholder="Notas (horario, especialidad…)"
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
            />
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white"
            >
              Guardar proveedor
            </button>
          </form>
        ) : null}

        <section className="space-y-3">
          {providers.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Todavía no hay proveedores.</p>
          ) : (
            providers.map((provider) => (
              <article
                key={provider.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <h3 className="font-semibold">{provider.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {[provider.phone, provider.email].filter(Boolean).join(" · ") || "Sin contacto"}
                </p>
                {provider.notes ? (
                  <p className="mt-2 text-sm">{provider.notes}</p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {provider._count.expedientes} expediente
                  {provider._count.expedientes === 1 ? "" : "s"} vinculado
                  {provider._count.expedientes === 1 ? "" : "s"}
                </p>
              </article>
            ))
          )}
        </section>
      </main>
      <BottomNav active="inicio" />
    </>
  );
}
