import {
  caseStatusLabel,
  priorityLabel,
  roleLabel,
} from "@/lib/labels";
import type {
  ExpedienteStatus,
  Membership,
  Priority,
  Provider,
  Role,
  User,
} from "@prisma/client";
import { updateExpediente } from "./actions";

type MemberOption = Membership & { user: User };

export function ManageExpedienteForm({
  expedienteId,
  status,
  priority,
  assigneeId,
  providerId,
  nextAction,
  blockedReason,
  members,
  providers,
}: {
  expedienteId: string;
  status: ExpedienteStatus;
  priority: Priority;
  assigneeId: string | null;
  providerId: string | null;
  nextAction: string | null;
  blockedReason: string | null;
  members: MemberOption[];
  providers: Provider[];
}) {
  return (
    <form action={updateExpediente} className="space-y-3">
      <input type="hidden" name="expedienteId" value={expedienteId} />

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Estado
        </span>
        <select
          name="status"
          defaultValue={status}
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        >
          {Object.entries(caseStatusLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Prioridad
        </span>
        <select
          name="priority"
          defaultValue={priority}
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        >
          {Object.entries(priorityLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Responsable
        </span>
        <select
          name="assigneeId"
          defaultValue={assigneeId ?? ""}
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        >
          <option value="">Sin asignar</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.user.name || member.user.email} ·{" "}
              {roleLabel[member.role as Role]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Proveedor
        </span>
        <select
          name="providerId"
          defaultValue={providerId ?? ""}
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        >
          <option value="">Sin proveedor</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Siguiente acción
        </span>
        <input
          name="nextAction"
          defaultValue={nextAction ?? ""}
          placeholder="Ej. Pedir presupuesto al proveedor"
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Motivo de bloqueo (si aplica)
        </span>
        <input
          name="blockedReason"
          defaultValue={blockedReason ?? ""}
          placeholder="Ej. Esperando aprobación"
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        />
      </label>

      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white"
      >
        Guardar cambios
      </button>
    </form>
  );
}
