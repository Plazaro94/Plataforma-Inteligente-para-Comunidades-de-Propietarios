"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";

export type LoginState = {
  error?: string;
};

export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "Introduce un email válido." };
  }

  const bootstrap = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const isBootstrap = bootstrap && email === bootstrap;
  const membership = await prisma.membership.findFirst({
    where: { user: { email } },
  });
  const invite = await prisma.invitation.findFirst({
    where: {
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!isBootstrap && !membership && !invite) {
    return {
      error:
        "Este email no tiene acceso. Necesitas una invitación de tu comunidad.",
    };
  }

  try {
    await signIn("nodemailer", {
      email,
      redirectTo: "/",
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "No se pudo enviar el enlace. Inténtalo de nuevo." };
    }
    throw error;
  }

  redirect(`/entrar/enviado?email=${encodeURIComponent(email)}`);
}
