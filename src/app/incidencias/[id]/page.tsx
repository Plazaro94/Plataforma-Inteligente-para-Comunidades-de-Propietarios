import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { prisma } from "@/lib/db";
import { caseStatusLabel, priorityLabel, roleLabel } from "@/lib/labels";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IncidenciaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await prisma.expediente.findUnique({
    where: { id },
    include: {
      creator: true,
      assignee: { include: { user: true } },
      provider: true,
      attachments: { orderBy: { createdAt: "desc" } },
      events: {
        include: { actor: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!item) notFound();

  return (
    <>
      <AppHeader title={item.reference} subtitle={item.title} backHref="/incidencias" />
      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 font-semibold text-[var(--brand)]">
              {caseStatusLabel[item.status]}
            </span>
            <span className="rounded-full bg-[var(--bg)] px-2.5 py-1 font-semibold">
              {priorityLabel[item.priority]}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text)]">{item.description}</p>
          {item.locationText ? (
            <p className="mt-3 text-sm text-[var(--muted)]">📍 {item.locationText}</p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
            Responsabilidad
          </h2>
          <p className="mt-2 text-base font-semibold">
            {item.assignee
              ? `${item.assignee.user.name} · ${roleLabel[item.assignee.role]}`
              : "Sin asignar"}
          </p>
          <p className="mt-3 text-sm">
            <span className="font-semibold">Siguiente acción: </span>
            {item.nextAction ?? "Pendiente de definir"}
          </p>
          {item.provider ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Proveedor: {item.provider.name}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
            Adjuntos
          </h2>
          {item.attachments.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Aún no hay fotos, documentos ni presupuestos.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {item.attachments.map((file) => (
                <li key={file.id} className="rounded-xl bg-[var(--bg)] px-3 py-2 text-sm">
                  {file.fileName}
                  {file.amountCents != null
                    ? ` · ${(file.amountCents / 100).toFixed(2)} €`
                    : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
            Historial
          </h2>
          <ol className="mt-3 space-y-3">
            {item.events.map((event) => (
              <li key={event.id} className="border-l-2 border-[var(--brand)] pl-3">
                <p className="text-sm font-medium">{event.message}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {event.actor?.name ?? "Sistema"} ·{" "}
                  {format(event.createdAt, "d MMM yyyy HH:mm", { locale: es })}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <p className="text-xs text-[var(--muted)]">
          Creada por {item.creator.name} ·{" "}
          {format(item.createdAt, "d MMM yyyy", { locale: es })}
        </p>
      </main>
      <BottomNav active="incidencias" />
    </>
  );
}
