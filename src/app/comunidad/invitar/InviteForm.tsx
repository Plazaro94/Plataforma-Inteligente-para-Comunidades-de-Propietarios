"use client";

import { useActionState } from "react";
import { createInvitation, type InviteState } from "./actions";
import { roleLabel } from "@/lib/labels";

const initial: InviteState = {};

export function InviteForm() {
  const [state, action, pending] = useActionState(createInvitation, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Email del vecino</span>
        <input
          type="email"
          name="email"
          required
          placeholder="vecino@email.com"
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Rol</span>
        <select
          name="role"
          defaultValue="VECINO"
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        >
          {Object.entries(roleLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {state.error ? (
        <p className="rounded-xl bg-[#fef3f2] px-3 py-3 text-sm text-[var(--danger)]">
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <div className="rounded-xl bg-[var(--brand-soft)] px-3 py-3 text-sm text-[var(--brand)]">
          <p className="font-semibold">{state.ok}</p>
          {state.link ? (
            <p className="mt-2 break-all text-[var(--text)]">{state.link}</p>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear invitación"}
      </button>
    </form>
  );
}
