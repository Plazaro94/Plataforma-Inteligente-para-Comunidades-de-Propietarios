"use client";

import { useActionState } from "react";
import { acceptInvitation, type AcceptState } from "@/app/comunidad/invitar/actions";

const initial: AcceptState = {};

export function AcceptInviteForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const bound = acceptInvitation.bind(null, token);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Tu nombre</span>
        <input
          name="name"
          required
          minLength={2}
          placeholder="Ej. María García"
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        />
      </label>

      <p className="rounded-xl bg-[var(--bg)] px-3 py-3 text-sm text-[var(--muted)]">
        Entrarás con <strong>{email}</strong> mediante un enlace mágico.
      </p>

      {state.error ? (
        <p className="rounded-xl bg-[#fef3f2] px-3 py-3 text-sm text-[var(--danger)]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Preparando acceso…" : "Continuar"}
      </button>
    </form>
  );
}
