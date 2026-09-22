"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { canManageInvites, requireMembership } from "@/lib/session";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

const INVITE_ROLES: Role[] = [
  "VECINO",
  "PRESIDENTE",
  "VICEPRESIDENTE",
  "ADMIN_FINCAS",
  "GESTOR",
];

export type InviteState = { error?: string; ok?: string; link?: string };

export async function createInvitation(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const { user, membership, community } = await requireMembership();
  if (!canManageInvites(membership.role)) {
    return { error: "No tienes permiso para invitar." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "VECINO") as Role;

  if (!email.includes("@")) return { error: "Email no válido." };
  if (!INVITE_ROLES.includes(role)) return { error: "Rol no válido." };

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  await prisma.invitation.create({
    data: {
      email,
      role,
      token,
      expiresAt,
      communityId: community.id,
      createdById: user.id,
    },
  });

  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const link = `${base}/invitacion/${token}`;

  revalidatePath("/comunidad/invitar");
  return {
    ok: `Invitación creada para ${email}.`,
    link,
  };
}

export type AcceptState = { error?: string };

export async function acceptInvitation(
  token: string,
  _prev: AcceptState,
  formData: FormData,
): Promise<AcceptState> {
  const name = String(formData.get("name") ?? "").trim();
  const invite = await prisma.invitation.findUnique({
    where: { token },
    include: { community: true },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return { error: "Esta invitación no es válida o ha caducado." };
  }

  if (name.length < 2) {
    return { error: "Indica tu nombre para que te reconozcan en la comunidad." };
  }

  await prisma.user.upsert({
    where: { email: invite.email },
    update: { name },
    create: { email: invite.email, name },
  });

  try {
    await signIn("nodemailer", {
      email: invite.email,
      redirectTo: "/",
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "No se pudo enviar el enlace de acceso." };
    }
    throw error;
  }

  redirect(`/entrar/enviado?email=${encodeURIComponent(invite.email)}`);
}
