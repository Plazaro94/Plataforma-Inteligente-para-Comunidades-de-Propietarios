"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMembership } from "@/lib/session";
import { storeUpload } from "@/lib/storage";

export async function createIncidencia(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const locationText = String(formData.get("locationText") ?? "").trim();
  const file = formData.get("photo");

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

  if (file instanceof File && file.size > 0) {
    if (file.size > 12 * 1024 * 1024) {
      throw new Error("La foto supera 12 MB.");
    }
    const stored = await storeUpload(file);
    await prisma.attachment.create({
      data: {
        expedienteId: expediente.id,
        kind: "FOTO",
        fileName: file.name || "foto.jpg",
        mimeType: file.type || "image/jpeg",
        sizeBytes: file.size,
        storageKey: stored.storageKey,
        url: stored.url,
      },
    });
    await prisma.expedienteEvent.create({
      data: {
        expedienteId: expediente.id,
        actorId: user.id,
        type: "ADJUNTO_ANADIDO",
        message: `${user.name} adjuntó una foto al crear la incidencia.`,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/incidencias");
  redirect(`/incidencias/${expediente.id}`);
}
