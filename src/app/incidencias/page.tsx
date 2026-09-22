import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { CaseCard } from "@/components/CaseCard";
import { ensureDemoCommunity } from "@/lib/demo";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function IncidenciasPage() {
  const community = await ensureDemoCommunity();
  const items = await prisma.expediente.findMany({
    where: { communityId: community.id },
    include: {
      assignee: { include: { user: true } },
    },
    orderBy: [{ status: "asc" }, { lastActivityAt: "asc" }],
  });

  return (
    <>
      <AppHeader title="Incidencias" subtitle="Transparencia total para la comunidad" />
      <main className="flex flex-1 flex-col gap-3 px-4 py-5">
        {items.map((item) => (
          <CaseCard key={item.id} item={item} />
        ))}
      </main>
      <BottomNav active="incidencias" />
    </>
  );
}
