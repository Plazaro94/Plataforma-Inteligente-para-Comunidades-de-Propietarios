import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureBootstrapCommunity } from "@/lib/bootstrap";
import { authConfig } from "@/auth.config";

async function canAccess(email: string) {
  const normalized = email.trim().toLowerCase();
  const bootstrap = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrap && normalized === bootstrap) return true;

  const membership = await prisma.membership.findFirst({
    where: { user: { email: normalized } },
  });
  if (membership) return true;

  const invite = await prisma.invitation.findFirst({
    where: {
      email: normalized,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  return Boolean(invite);
}

async function acceptPendingInvitations(userId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const invites = await prisma.invitation.findMany({
    where: {
      email: normalized,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  for (const invite of invites) {
    await prisma.membership.upsert({
      where: {
        userId_communityId: {
          userId,
          communityId: invite.communityId,
        },
      },
      update: { role: invite.role },
      create: {
        userId,
        communityId: invite.communityId,
        role: invite.role,
      },
    });
    await prisma.invitation.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  }
}

async function ensureBootstrapMembership(userId: string, email: string) {
  const bootstrap = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (!bootstrap || email.trim().toLowerCase() !== bootstrap) return;

  const community = await ensureBootstrapCommunity();
  await prisma.membership.upsert({
    where: {
      userId_communityId: { userId, communityId: community.id },
    },
    update: { role: "GESTOR" satisfies Role },
    create: {
      userId,
      communityId: community.id,
      role: "GESTOR",
    },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // JWT is required so Vercel Edge middleware can read the session.
  session: { strategy: "jwt" },
  providers: [
    Nodemailer({
      server: process.env.EMAIL_SERVER || "smtp://127.0.0.1:1025",
      from: process.env.EMAIL_FROM || "Comunidad <noreply@localhost>",
      async sendVerificationRequest({ identifier, url }) {
        const email = identifier.trim().toLowerCase();
        await prisma.devMagicLink.upsert({
          where: { email },
          update: { url, createdAt: new Date() },
          create: { email, url },
        });

        const server = process.env.EMAIL_SERVER;
        if (server && server !== "smtp://127.0.0.1:1025") {
          const nodemailer = await import("nodemailer");
          const transport = nodemailer.createTransport(server);
          await transport.sendMail({
            to: email,
            from: process.env.EMAIL_FROM || "Comunidad <noreply@localhost>",
            subject: "Tu acceso a la comunidad",
            text: `Entra con este enlace (válido una vez):\n\n${url}\n`,
            html: `<p>Entra con este enlace (válido una vez):</p><p><a href="${url}">${url}</a></p>`,
          });
        }

        console.log(`[magic-link] ${email} -> ${url}`);
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;
      return canAccess(user.email);
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email || !user.id) return;
      await ensureBootstrapMembership(user.id, user.email);
      await acceptPendingInvitations(user.id, user.email);
    },
    async signIn({ user }) {
      if (!user.email || !user.id) return;
      await ensureBootstrapMembership(user.id, user.email);
      await acceptPendingInvitations(user.id, user.email);
    },
  },
});
