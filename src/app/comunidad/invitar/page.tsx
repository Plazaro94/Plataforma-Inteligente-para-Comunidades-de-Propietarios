import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { canManageInvites, requireMembership } from "@/lib/session";
import { prisma } from "@/lib/db";
import { roleLabel } from "@/lib/labels";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { InviteForm } from "./InviteForm";

export const dynamic = "force-dynamic";

export default async function InvitarPage() {
  const { membership, community } = await requireMembership();
  if (!canManageInvites(membership.role)) {
    redirect("/");
  }

  const invites = await prisma.invitation.findMany({
    where: { communityId: community.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <>
      <AppHeader
        title="Invitar"
        subtitle={community.name}
        backHref="/"
        showSignOut
      />
      <main className="flex flex-1 flex-col gap-5 px-4 py-5">
        <InviteForm />

        <section className="space-y-3">
          <h2 className="text-lg font-bold">Últimas invitaciones</h2>
          {invites.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Todavía no hay invitaciones.</p>
          ) : (
            invites.map((invite) => (
              <article
                key={invite.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm"
              >
                <p className="font-semibold">{invite.email}</p>
                <p className="mt-1 text-[var(--muted)]">
                  {roleLabel[invite.role]} ·{" "}
                  {invite.acceptedAt
                    ? `Aceptada ${format(invite.acceptedAt, "d MMM", { locale: es })}`
                    : `Pendiente · caduca ${format(invite.expiresAt, "d MMM", { locale: es })}`}
                </p>
              </article>
            ))
          )}
        </section>
      </main>
      <BottomNav active="inicio" />
    </>
  );
}
