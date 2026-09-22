"use client";

import { useActionState } from "react";
import { requestMagicLink, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Tu email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="tu@email.com"
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        />
      </label>

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
        {pending ? "Enviando…" : "Recibir enlace de acceso"}
      </button>
    </form>
  );
}
