import Link from "next/link";
import type { Expediente, Membership, User } from "@prisma/client";
import { caseStatusLabel, priorityLabel } from "@/lib/labels";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type CaseCardProps = {
  item: Expediente & {
    assignee: (Membership & { user: User }) | null;
  };
};

export function CaseCard({ item }: CaseCardProps) {
  const idle = formatDistanceToNow(item.lastActivityAt, {
    addSuffix: true,
    locale: es,
  });

  return (
    <Link
      href={`/incidencias/${item.id}`}
      className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--muted)]">{item.reference}</p>
          <h2 className="mt-1 text-base font-semibold leading-snug">{item.title}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand)]">
          {caseStatusLabel[item.status]}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{item.description}</p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
        <span className="rounded-md bg-[var(--bg)] px-2 py-1">
          Prioridad: {priorityLabel[item.priority]}
        </span>
        <span className="rounded-md bg-[var(--bg)] px-2 py-1">
          Resp.:{" "}
          {item.assignee
            ? item.assignee.user.name || item.assignee.user.email
            : "Sin asignar"}
        </span>
        <span className="rounded-md bg-[var(--bg)] px-2 py-1">Actividad {idle}</span>
      </div>

      {item.nextAction ? (
        <p className="mt-3 rounded-xl bg-[var(--bg)] px-3 py-2 text-sm">
          <span className="font-semibold">Siguiente: </span>
          {item.nextAction}
        </p>
      ) : (
        <p className="mt-3 rounded-xl bg-[#fff4ed] px-3 py-2 text-sm text-[var(--warn)]">
          Sin siguiente acción definida
        </p>
      )}
    </Link>
  );
}
