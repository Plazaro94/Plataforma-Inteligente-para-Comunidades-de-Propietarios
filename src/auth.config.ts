import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/entrar",
    verifyRequest: "/entrar/enviado",
    error: "/entrar",
  },
  providers: [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isPublic =
        pathname.startsWith("/entrar") ||
        pathname.startsWith("/invitacion") ||
        pathname.startsWith("/api/auth");

      if (isPublic) return true;
      return Boolean(auth?.user);
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
