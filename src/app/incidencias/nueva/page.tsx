import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { createIncidencia } from "../actions";

export default function NuevaIncidenciaPage() {
  return (
    <>
      <AppHeader
        title="Nueva incidencia"
        subtitle="Cuéntalo en una frase. Luego añadimos el resto."
        backHref="/incidencias"
      />
      <main className="flex flex-1 flex-col px-4 py-5">
        <form action={createIncidencia} className="flex flex-1 flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">¿Qué ocurre?</span>
            <input
              name="title"
              required
              maxLength={120}
              placeholder="Ej. La puerta del garaje no cierra"
              className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Detalles</span>
            <textarea
              name="description"
              required
              rows={5}
              placeholder="Describe el problema. Si puedes, cuándo ocurre y desde cuándo."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Ubicación (opcional)</span>
            <input
              name="locationText"
              maxLength={120}
              placeholder="Ej. Garaje · portal 2"
              className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
            />
          </label>

          <p className="rounded-xl bg-[var(--brand-soft)] px-3 py-3 text-sm text-[var(--brand)]">
            La foto y los presupuestos/documentos se añadirán en el siguiente paso del
            esqueleto. Ahora priorizamos registrar y trazar el asunto.
          </p>

          <button
            type="submit"
            className="mt-auto inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white"
          >
            Enviar incidencia
          </button>
        </form>
      </main>
      <BottomNav active="nueva" />
    </>
  );
}
