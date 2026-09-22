import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { CaseCard } from "@/components/CaseCard";
import { prisma } from "@/lib/db";
import { requireMembership } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function IncidenciasPage() {
  const { community } = await requireMembership();
  const items = await prisma.expediente.findMany({
    where: { communityId: community.id },
    include: {
      assignee: { include: { user: true } },
    },
    orderBy: [{ status: "asc" }, { lastActivityAt: "asc" }],
  });

  return (
    <>
      <AppHeader
        title="Incidencias"
        subtitle="Transparencia total para la comunidad"
        showSignOut
      />
      <main className="flex flex-1 flex-col gap-3 px-4 py-5">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            No hay incidencias todavía.
          </p>
        ) : (
          items.map((item) => <CaseCard key={item.id} item={item} />)
        )}
      </main>
      <BottomNav active="incidencias" />
    </>
  );
}
