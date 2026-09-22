"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMembership } from "@/lib/session";

export async function createIncidencia(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const locationText = String(formData.get("locationText") ?? "").trim();

  if (!title || !description) {
    throw new Error("Título y descripción son obligatorios.");
  }

  const { user, community } = await requireMembership();

  const count = await prisma.expediente.count({
    where: { communityId: community.id },
  });
  const reference = `INC-${String(count + 1).padStart(3, "0")}`;

  const expediente = await prisma.expediente.create({
    data: {
      reference,
      title,
      description,
      locationText: locationText || null,
      communityId: community.id,
      creatorId: user.id,
      status: "NUEVA",
      priority: "MEDIA",
      nextAction: "Asignar responsable",
    },
  });

  await prisma.expedienteEvent.create({
    data: {
      expedienteId: expediente.id,
      actorId: user.id,
      type: "CREADA",
      message: `${user.name} registró la incidencia.`,
    },
  });

  revalidatePath("/");
  revalidatePath("/incidencias");
  redirect(`/incidencias/${expediente.id}`);
}
