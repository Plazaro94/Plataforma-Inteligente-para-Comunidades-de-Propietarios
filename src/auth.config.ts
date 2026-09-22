import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/entrar",
    verifyRequest: "/entrar/enviado",
    error: "/entrar",
  },
  providers: [],
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
  },
  trustHost: true,
} satisfies NextAuthConfig;
