import { notFound } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { prisma } from "@/lib/db";
import {
  attachmentKindLabel,
  caseStatusLabel,
  priorityLabel,
  roleLabel,
} from "@/lib/labels";
import { requireMembership } from "@/lib/session";
import { daysSince, isStalled, STALE_AFTER_DAYS } from "@/lib/expediente";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ManageExpedienteForm } from "./ManageExpedienteForm";
import { AttachmentForm, CommentForm } from "./AttachmentForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IncidenciaDetailPage({ params }: PageProps) {
  const { community } = await requireMembership();
  const { id } = await params;

  const [item, members, providers] = await Promise.all([
    prisma.expediente.findFirst({
      where: { id, communityId: community.id },
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
    }),
    prisma.membership.findMany({
      where: { communityId: community.id },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.provider.findMany({
      where: { communityId: community.id },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!item) notFound();

  const creatorName = item.creator.name || item.creator.email;
  const idleDays = daysSince(item.lastActivityAt);
  const stalled = item.status !== "CERRADA" && isStalled(item.lastActivityAt);

  return (
    <>
      <AppHeader title={item.reference} subtitle={item.title} backHref="/incidencias" />
      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        {stalled ? (
          <p className="rounded-2xl bg-[#fff4ed] px-4 py-3 text-sm font-semibold text-[var(--warn)]">
            Lleva {idleDays} días sin movimiento (umbral: {STALE_AFTER_DAYS} días).
          </p>
        ) : null}

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
          {item.status === "BLOQUEADA" && item.blockedReason ? (
            <p className="mt-3 rounded-xl bg-[#fff4ed] px-3 py-2 text-sm text-[var(--warn)]">
              Bloqueada: {item.blockedReason}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
            Mover el asunto
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Responsable, estado y siguiente acción quedan registrados.
          </p>
          <div className="mt-4">
            <ManageExpedienteForm
              expedienteId={item.id}
              status={item.status}
              priority={item.priority}
              assigneeId={item.assigneeId}
              providerId={item.providerId}
              nextAction={item.nextAction}
              blockedReason={item.blockedReason}
              members={members}
              providers={providers}
            />
          </div>
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
              {item.attachments.map((file) => {
                const href = file.url || `/api/files/${file.id}`;
                return (
                  <li key={file.id}>
                    <Link
                      href={href}
                      className="block rounded-xl bg-[var(--bg)] px-3 py-2 text-sm font-medium text-[var(--brand)]"
                      target={file.url ? "_blank" : undefined}
                    >
                      {attachmentKindLabel[file.kind]} · {file.fileName}
                      {file.amountCents != null
                        ? ` · ${(file.amountCents / 100).toFixed(2)} €`
                        : ""}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4">
            <AttachmentForm expedienteId={item.id} />
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
            Comentario
          </h2>
          <div className="mt-3">
            <CommentForm expedienteId={item.id} />
          </div>
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
                  {event.actor?.name || event.actor?.email || "Sistema"} ·{" "}
                  {format(event.createdAt, "d MMM yyyy HH:mm", { locale: es })}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <p className="text-xs text-[var(--muted)]">
          Creada por {creatorName} ·{" "}
          {format(item.createdAt, "d MMM yyyy", { locale: es })}
          {item.assignee
            ? ` · Resp. ${item.assignee.user.name || item.assignee.user.email} (${roleLabel[item.assignee.role]})`
            : ""}
        </p>
      </main>
      <BottomNav active="incidencias" />
    </>
  );
}
