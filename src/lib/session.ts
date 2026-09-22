import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/entrar");
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? session.user.email,
  };
}

export async function requireMembership() {
  const user = await requireUser();
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: {
      community: true,
      user: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    redirect("/sin-comunidad");
  }

  return { user, membership, community: membership.community };
}

export async function getMembershipOrNull() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;

  const user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? session.user.email,
  };

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: {
      community: true,
      user: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) return null;
  return { user, membership, community: membership.community };
}

export function canManageInvites(role: string) {
  return role === "GESTOR" || role === "PRESIDENTE" || role === "ADMIN_FINCAS";
}
