import { attachmentKindLabel } from "@/lib/labels";
import { addAttachment, addComment } from "./actions";

export function AttachmentForm({ expedienteId }: { expedienteId: string }) {
  return (
    <form action={addAttachment} className="space-y-3">
      <input type="hidden" name="expedienteId" value={expedienteId} />

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Tipo
        </span>
        <select
          name="kind"
          defaultValue="FOTO"
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        >
          {Object.entries(attachmentKindLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Archivo
        </span>
        <input
          type="file"
          name="file"
          required
          accept="image/*,application/pdf,.pdf,.doc,.docx"
          capture="environment"
          className="block w-full text-sm"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Importe € (solo presupuestos)
        </span>
        <input
          name="amount"
          inputMode="decimal"
          placeholder="Ej. 1280"
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
        />
      </label>

      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold"
      >
        Subir adjunto
      </button>
    </form>
  );
}

export function CommentForm({ expedienteId }: { expedienteId: string }) {
  return (
    <form action={addComment} className="space-y-3">
      <input type="hidden" name="expedienteId" value={expedienteId} />
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Comentario
        </span>
        <textarea
          name="message"
          required
          rows={3}
          placeholder="Añade una nota visible para toda la comunidad"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
        />
      </label>
      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold"
      >
        Publicar comentario
      </button>
    </form>
  );
}
