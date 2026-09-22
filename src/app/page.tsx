import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { CaseCard } from "@/components/CaseCard";
import { ensureDemoCommunity } from "@/lib/demo";
import { prisma } from "@/lib/db";
import { APP_TAGLINE } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const community = await ensureDemoCommunity();
  const openCases = await prisma.expediente.findMany({
    where: {
      communityId: community.id,
      status: { notIn: ["CERRADA"] },
    },
    include: {
      assignee: { include: { user: true } },
    },
    orderBy: { lastActivityAt: "asc" },
    take: 5,
  });

  const stalled = openCases.filter((item) => !item.nextAction || !item.assigneeId);

  return (
    <>
      <AppHeader title={community.name} subtitle={APP_TAGLINE} />
      <main className="flex flex-1 flex-col gap-5 px-4 py-5">
        <section className="rounded-2xl bg-[var(--brand)] px-4 py-5 text-white">
          <p className="text-sm text-white/80">Resumen</p>
          <h2 className="mt-1 text-2xl font-bold">
            {openCases.length} asunto{openCases.length === 1 ? "" : "s"} abierto
            {openCases.length === 1 ? "" : "s"}
          </h2>
          <p className="mt-2 text-sm text-white/90">
            {stalled.length > 0
              ? `${stalled.length} necesitan responsable o siguiente acción.`
              : "Todos tienen responsable y siguiente paso."}
          </p>
          <Link
            href="/incidencias/nueva"
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-[var(--brand)]"
          >
            + Comunicar incidencia
          </Link>
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-bold">Qué está pasando</h2>
            <Link href="/incidencias" className="text-sm font-semibold text-[var(--brand)]">
              Ver todas
            </Link>
          </div>
          {openCases.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
              Todavía no hay incidencias. Sé la primera persona en registrar una.
            </p>
          ) : (
            openCases.map((item) => <CaseCard key={item.id} item={item} />)
          )}
        </section>
      </main>
      <BottomNav active="inicio" />
    </>
  );
}
