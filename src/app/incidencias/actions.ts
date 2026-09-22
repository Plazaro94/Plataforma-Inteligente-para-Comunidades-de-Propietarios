"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensureDemoCommunity } from "@/lib/demo";

export async function createIncidencia(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const locationText = String(formData.get("locationText") ?? "").trim();

  if (!title || !description) {
    throw new Error("Título y descripción son obligatorios.");
  }

  const community = await ensureDemoCommunity();
  const creator = await prisma.user.findFirst({
    where: { email: "ana@demo.local" },
  });
  if (!creator) throw new Error("Usuario demo no encontrado.");

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
      creatorId: creator.id,
      status: "NUEVA",
      priority: "MEDIA",
      nextAction: "Asignar responsable",
    },
  });

  await prisma.expedienteEvent.create({
    data: {
      expedienteId: expediente.id,
      actorId: creator.id,
      type: "CREADA",
      message: `${creator.name} registró la incidencia.`,
    },
  });

  revalidatePath("/");
  revalidatePath("/incidencias");
  redirect(`/incidencias/${expediente.id}`);
}
