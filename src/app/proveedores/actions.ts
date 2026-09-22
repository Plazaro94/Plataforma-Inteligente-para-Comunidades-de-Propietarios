"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { canManageInvites, requireMembership } from "@/lib/session";

export async function createProvider(formData: FormData) {
  const { membership, community } = await requireMembership();
  if (!canManageInvites(membership.role)) {
    throw new Error("No tienes permiso para crear proveedores.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) throw new Error("El nombre es obligatorio.");

  await prisma.provider.create({
    data: {
      communityId: community.id,
      name,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
    },
  });

  revalidatePath("/proveedores");
  revalidatePath("/");
}
