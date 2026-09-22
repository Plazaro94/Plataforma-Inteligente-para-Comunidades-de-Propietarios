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
  searchParams: Promise<{
    guardado?: string;
    comentario?: string;
    adjunto?: string;
  }>;
};

export default async function IncidenciaDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { community } = await requireMembership();
  const { id } = await params;
  const flags = await searchParams;

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
  const flash =
    flags.guardado === "1"
      ? "Cambios guardados."
      : flags.comentario === "1"
        ? "Comentario publicado."
        : flags.adjunto === "1"
          ? "Adjunto subido."
          : null;

  return (
    <>
      <AppHeader
        title={item.reference}
        subtitle={item.title}
        backHref="/incidencias"
        showSignOut
      />
      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        {flash ? (
          <p className="rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-sm font-semibold text-[#0f766e]">
            {flash}
          </p>
        ) : null}

        {stalled ? (
          <p className="rounded-2xl bg-[#fff4ed] px-4 py-3 text-sm font-semibold text-[var(--warn)]">
            Lleva {idleDays} días sin movimiento (umbral: {STALE_AFTER_DAYS} días).
          </p>
        ) : null}

        <section className="rounded-2xl border border-[var(--border)] bg-white p-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 font-semibold text-[#0f766e]">
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
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <span className="font-semibold">Responsable: </span>
              {item.assignee
                ? `${item.assignee.user.name || item.assignee.user.email} · ${roleLabel[item.assignee.role]}`
                : "Sin asignar"}
            </p>
            <p>
              <span className="font-semibold">Siguiente: </span>
              {item.nextAction ?? "Pendiente de definir"}
            </p>
            {item.provider ? (
              <p>
                <span className="font-semibold">Proveedor: </span>
                {item.provider.name}
              </p>
            ) : null}
          </div>
          {item.status === "BLOQUEADA" && item.blockedReason ? (
            <p className="mt-3 rounded-xl bg-[#fff4ed] px-3 py-2 text-sm text-[var(--warn)]">
              Bloqueada: {item.blockedReason}
            </p>
          ) : null}
        </section>

        <details className="rounded-2xl border border-[var(--border)] bg-white p-4" open>
          <summary className="cursor-pointer text-base font-bold">
            Mover el asunto
          </summary>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Cambia estado, responsable o siguiente paso. Queda en el historial.
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
        </details>

        <details className="rounded-2xl border border-[var(--border)] bg-white p-4">
          <summary className="cursor-pointer text-base font-bold">
            Adjuntos ({item.attachments.length})
          </summary>
          {item.attachments.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
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
                      className="block rounded-xl bg-[var(--bg)] px-3 py-2 text-sm font-medium text-[#0f766e]"
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
        </details>

        <details className="rounded-2xl border border-[var(--border)] bg-white p-4">
          <summary className="cursor-pointer text-base font-bold">Comentar</summary>
          <div className="mt-3">
            <CommentForm expedienteId={item.id} />
          </div>
        </details>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-4">
          <h2 className="text-base font-bold">Historial</h2>
          <ol className="mt-3 space-y-3">
            {item.events.map((event) => (
              <li key={event.id} className="border-l-2 border-[#0f766e] pl-3">
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
        </p>
      </main>
      <BottomNav active="incidencias" />
    </>
  );
}
