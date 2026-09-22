import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { APP_TAGLINE } from "@/lib/labels";
import { LoginForm } from "./LoginForm";

type PageProps = {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
};

const errorMessages: Record<string, string> = {
  Configuration: "Hay un problema de configuración del acceso.",
  AccessDenied: "Este email no tiene acceso a la comunidad.",
  Verification: "El enlace ha caducado o ya se usó. Pide uno nuevo.",
  Default: "No se pudo completar el acceso. Inténtalo de nuevo.",
};

export default async function EntrarPage({ searchParams }: PageProps) {
  const session = await auth();
  if (session?.user) redirect("/");

  const { error } = await searchParams;
  const message = error
    ? errorMessages[error] || errorMessages.Default
    : null;

  return (
    <>
      <AppHeader title="Entrar" subtitle={APP_TAGLINE} />
      <main className="flex flex-1 flex-col gap-5 px-4 py-5">
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Acceso solo por invitación. Te enviamos un enlace mágico a tu email:
          sin contraseñas.
        </p>
        {message ? (
          <p className="rounded-xl bg-[#fef3f2] px-3 py-3 text-sm text-[var(--danger)]">
            {message}
          </p>
        ) : null}
        <LoginForm />
      </main>
    </>
  );
}
