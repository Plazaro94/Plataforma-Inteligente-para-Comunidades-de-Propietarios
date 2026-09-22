"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AttachmentKind, ExpedienteStatus, Priority } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireMembership } from "@/lib/session";
import { caseStatusLabel, priorityLabel } from "@/lib/labels";
import { expedienteStatuses, priorities } from "@/lib/expediente";
import { storeUpload } from "@/lib/storage";

export type ActionState = {
  ok?: string;
  error?: string;
};

async function getOwnedExpediente(id: string) {
  const { user, community } = await requireMembership();
  const expediente = await prisma.expediente.findFirst({
    where: { id, communityId: community.id },
    include: {
      assignee: { include: { user: true } },
    },
  });
  if (!expediente) throw new Error("Expediente no encontrado.");
  return { user, community, expediente };
}

function touchPaths(expedienteId: string) {
  revalidatePath("/");
  revalidatePath("/incidencias");
  revalidatePath(`/incidencias/${expedienteId}`);
}

function actorName(user: { name: string | null; email: string }) {
  return user.name || user.email;
}

export async function updateExpediente(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("expedienteId") ?? "");
  const status = String(formData.get("status") ?? "") as ExpedienteStatus;
  const priority = String(formData.get("priority") ?? "") as Priority;
  const assigneeIdRaw = String(formData.get("assigneeId") ?? "");
  const providerIdRaw = String(formData.get("providerId") ?? "");
  const nextAction = String(formData.get("nextAction") ?? "").trim();
  const blockedReason = String(formData.get("blockedReason") ?? "").trim();

  if (!id) return { error: "Falta el expediente." };
  if (!expedienteStatuses.includes(status)) return { error: "Estado no válido." };
  if (!priorities.includes(priority)) return { error: "Prioridad no válida." };

  let user;
  let community;
  let expediente;
  try {
    ({ user, community, expediente } = await getOwnedExpediente(id));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Expediente no encontrado.",
    };
  }

  const assigneeId = assigneeIdRaw || null;
  const providerId = providerIdRaw || null;
  const who = actorName(user);

  if (assigneeId) {
    const member = await prisma.membership.findFirst({
      where: { id: assigneeId, communityId: community.id },
    });
    if (!member) return { error: "Responsable no válido." };
  }

  if (providerId) {
    const provider = await prisma.provider.findFirst({
      where: { id: providerId, communityId: community.id },
    });
    if (!provider) return { error: "Proveedor no válido." };
  }

  const events: {
    type:
      | "ESTADO_CAMBIADO"
      | "RESPONSABLE_ASIGNADO"
      | "SIGUIENTE_ACCION"
      | "PROVEEDOR_VINCULADO"
      | "SISTEMA";
    message: string;
  }[] = [];

  if (status !== expediente.status) {
    events.push({
      type: "ESTADO_CAMBIADO",
      message: `${who} cambió el estado a “${caseStatusLabel[status]}”.`,
    });
  }
  if (assigneeId !== expediente.assigneeId) {
    const assignee = assigneeId
      ? await prisma.membership.findUnique({
          where: { id: assigneeId },
          include: { user: true },
        })
      : null;
    events.push({
      type: "RESPONSABLE_ASIGNADO",
      message: assignee
        ? `${who} asignó a ${actorName(assignee.user)}.`
        : `${who} dejó el expediente sin responsable.`,
    });
  }
  if (providerId !== expediente.providerId) {
    const provider = providerId
      ? await prisma.provider.findUnique({ where: { id: providerId } })
      : null;
    events.push({
      type: "PROVEEDOR_VINCULADO",
      message: provider
        ? `${who} vinculó al proveedor ${provider.name}.`
        : `${who} quitó el proveedor del expediente.`,
    });
  }
  if (nextAction !== (expediente.nextAction ?? "")) {
    events.push({
      type: "SIGUIENTE_ACCION",
      message: nextAction
        ? `${who} definió la siguiente acción: ${nextAction}`
        : `${who} quitó la siguiente acción.`,
    });
  }
  if (priority !== expediente.priority) {
    events.push({
      type: "SISTEMA",
      message: `${who} cambió la prioridad a “${priorityLabel[priority]}”.`,
    });
  }

  try {
    await prisma.expediente.update({
      where: { id },
      data: {
        status,
        priority,
        assigneeId,
        providerId,
        nextAction: nextAction || null,
        blockedReason:
          status === "BLOQUEADA" ? blockedReason || "Sin detalle" : null,
        lastActivityAt: new Date(),
        closedAt: status === "CERRADA" ? new Date() : null,
      },
    });

    if (events.length > 0) {
      await prisma.expedienteEvent.createMany({
        data: events.map((event) => ({
          expedienteId: id,
          actorId: user.id,
          type: event.type,
          message: event.message,
        })),
      });
    }
  } catch (error) {
    console.error("updateExpediente", error);
    return { error: "No se pudieron guardar los cambios." };
  }

  touchPaths(id);
  redirect(`/incidencias/${id}?guardado=1`);
}

export async function addComment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("expedienteId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { error: "Escribe un comentario." };

  let user;
  try {
    ({ user } = await getOwnedExpediente(id));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Expediente no encontrado.",
    };
  }

  const who = actorName(user);

  try {
    await prisma.$transaction([
      prisma.expedienteEvent.create({
        data: {
          expedienteId: id,
          actorId: user.id,
          type: "COMENTARIO",
          message: `${who}: ${message}`,
        },
      }),
      prisma.expediente.update({
        where: { id },
        data: { lastActivityAt: new Date() },
      }),
    ]);
  } catch (error) {
    console.error("addComment", error);
    return { error: "No se pudo publicar el comentario." };
  }

  touchPaths(id);
  redirect(`/incidencias/${id}?comentario=1`);
}

export async function addAttachment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("expedienteId") ?? "");
  const kind = String(formData.get("kind") ?? "OTRO") as AttachmentKind;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo." };
  }
  if (file.size > 12 * 1024 * 1024) {
    return { error: "El archivo supera 12 MB." };
  }

  const allowed: AttachmentKind[] = ["FOTO", "DOCUMENTO", "PRESUPUESTO", "OTRO"];
  if (!allowed.includes(kind)) return { error: "Tipo de adjunto no válido." };

  let user;
  try {
    ({ user } = await getOwnedExpediente(id));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Expediente no encontrado.",
    };
  }

  const who = actorName(user);

  let stored;
  try {
    stored = await storeUpload(file);
  } catch (error) {
    console.error("storeUpload", error);
    return { error: "No se pudo guardar el archivo en el servidor." };
  }

  let amountCents: number | null = null;
  if (kind === "PRESUPUESTO" && amountRaw) {
    const parsed = Number(amountRaw.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { error: "Importe no válido." };
    }
    amountCents = Math.round(parsed * 100);
  }

  try {
    await prisma.$transaction([
      prisma.attachment.create({
        data: {
          expedienteId: id,
          kind,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          storageKey: stored.storageKey,
          url: stored.url,
          amountCents,
        },
      }),
      prisma.expedienteEvent.create({
        data: {
          expedienteId: id,
          actorId: user.id,
          type: "ADJUNTO_ANADIDO",
          message:
            kind === "PRESUPUESTO" && amountCents != null
              ? `${who} adjuntó presupuesto “${file.name}” (${(amountCents / 100).toFixed(2)} €).`
              : `${who} adjuntó ${kind.toLowerCase()} “${file.name}”.`,
        },
      }),
      prisma.expediente.update({
        where: { id },
        data: { lastActivityAt: new Date() },
      }),
    ]);
  } catch (error) {
    console.error("addAttachment", error);
    return { error: "No se pudo subir el archivo." };
  }

  touchPaths(id);
  redirect(`/incidencias/${id}?adjunto=1`);
}
