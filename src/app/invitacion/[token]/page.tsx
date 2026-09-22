import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { prisma } from "@/lib/db";
import { roleLabel } from "@/lib/labels";
import { AcceptInviteForm } from "./AcceptInviteForm";

type PageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function InvitacionPage({ params }: PageProps) {
  const { token } = await params;
  const invite = await prisma.invitation.findUnique({
    where: { token },
    include: { community: true },
  });

  if (!invite) notFound();

  const expired = invite.expiresAt < new Date();
  const accepted = Boolean(invite.acceptedAt);

  return (
    <>
      <AppHeader title="Invitación" subtitle={invite.community.name} />
      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        {accepted || expired ? (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
            {accepted
              ? "Esta invitación ya fue aceptada. Entra con tu email."
              : "Esta invitación ha caducado. Pide una nueva a tu comunidad."}
          </p>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Te invitan como <strong>{roleLabel[invite.role]}</strong>. Completa tu
              nombre y te enviamos el acceso.
            </p>
            <AcceptInviteForm token={token} email={invite.email} />
          </>
        )}
      </main>
    </>
  );
}
