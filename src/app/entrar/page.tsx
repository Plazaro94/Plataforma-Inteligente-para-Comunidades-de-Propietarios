import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { APP_TAGLINE } from "@/lib/labels";
import { LoginForm } from "./LoginForm";

export default async function EntrarPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <>
      <AppHeader title="Entrar" subtitle={APP_TAGLINE} />
      <main className="flex flex-1 flex-col gap-5 px-4 py-5">
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Acceso solo por invitación. Te enviamos un enlace mágico a tu email:
          sin contraseñas.
        </p>
        <LoginForm />
      </main>
    </>
  );
}
