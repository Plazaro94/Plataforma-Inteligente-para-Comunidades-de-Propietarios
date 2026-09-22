import { prisma } from "@/lib/db";

/** Creates the pilot community used for bootstrap admin access. */
export async function ensureBootstrapCommunity() {
  return prisma.community.upsert({
    where: { slug: "mi-comunidad" },
    update: {},
    create: {
      name: "Mi comunidad",
      slug: "mi-comunidad",
    },
  });
}
