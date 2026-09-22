"use server";

import { revalidatePath } from "next/cache";
import type { AttachmentKind, ExpedienteStatus, Priority } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireMembership } from "@/lib/session";
import { caseStatusLabel, priorityLabel } from "@/lib/labels";
import { expedienteStatuses, priorities } from "@/lib/expediente";
import { storeUpload } from "@/lib/storage";

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

export async function updateExpediente(formData: FormData) {
  const id = String(formData.get("expedienteId") ?? "");
  const status = String(formData.get("status") ?? "") as ExpedienteStatus;
  const priority = String(formData.get("priority") ?? "") as Priority;
  const assigneeIdRaw = String(formData.get("assigneeId") ?? "");
  const providerIdRaw = String(formData.get("providerId") ?? "");
  const nextAction = String(formData.get("nextAction") ?? "").trim();
  const blockedReason = String(formData.get("blockedReason") ?? "").trim();

  if (!expedienteStatuses.includes(status)) throw new Error("Estado no válido.");
  if (!priorities.includes(priority)) throw new Error("Prioridad no válida.");

  const { user, community, expediente } = await getOwnedExpediente(id);
  const assigneeId = assigneeIdRaw || null;
  const providerId = providerIdRaw || null;

  if (assigneeId) {
    const member = await prisma.membership.findFirst({
      where: { id: assigneeId, communityId: community.id },
    });
    if (!member) throw new Error("Responsable no válido.");
  }

  if (providerId) {
    const provider = await prisma.provider.findFirst({
      where: { id: providerId, communityId: community.id },
    });
    if (!provider) throw new Error("Proveedor no válido.");
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
      message: `${user.name} cambió el estado a “${caseStatusLabel[status]}”.`,
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
        ? `${user.name} asignó a ${assignee.user.name || assignee.user.email}.`
        : `${user.name} dejó el expediente sin responsable.`,
    });
  }
  if (providerId !== expediente.providerId) {
    const provider = providerId
      ? await prisma.provider.findUnique({ where: { id: providerId } })
      : null;
    events.push({
      type: "PROVEEDOR_VINCULADO",
      message: provider
        ? `${user.name} vinculó al proveedor ${provider.name}.`
        : `${user.name} quitó el proveedor del expediente.`,
    });
  }
  if (nextAction !== (expediente.nextAction ?? "")) {
    events.push({
      type: "SIGUIENTE_ACCION",
      message: nextAction
        ? `${user.name} definió la siguiente acción: ${nextAction}`
        : `${user.name} quitó la siguiente acción.`,
    });
  }
  if (priority !== expediente.priority) {
    events.push({
      type: "SISTEMA",
      message: `${user.name} cambió la prioridad a “${priorityLabel[priority]}”.`,
    });
  }

  await prisma.expediente.update({
    where: { id },
    data: {
      status,
      priority,
      assigneeId,
      providerId,
      nextAction: nextAction || null,
      blockedReason: status === "BLOQUEADA" ? blockedReason || "Sin detalle" : null,
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

  touchPaths(id);
}

export async function addComment(formData: FormData) {
  const id = String(formData.get("expedienteId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!message) throw new Error("Escribe un comentario.");

  const { user } = await getOwnedExpediente(id);

  await prisma.$transaction([
    prisma.expedienteEvent.create({
      data: {
        expedienteId: id,
        actorId: user.id,
        type: "COMENTARIO",
        message: `${user.name}: ${message}`,
      },
    }),
    prisma.expediente.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    }),
  ]);

  touchPaths(id);
}

export async function addAttachment(formData: FormData) {
  const id = String(formData.get("expedienteId") ?? "");
  const kind = String(formData.get("kind") ?? "OTRO") as AttachmentKind;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecciona un archivo.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("El archivo supera 12 MB.");
  }

  const allowed: AttachmentKind[] = ["FOTO", "DOCUMENTO", "PRESUPUESTO", "OTRO"];
  if (!allowed.includes(kind)) throw new Error("Tipo de adjunto no válido.");

  const { user } = await getOwnedExpediente(id);
  const stored = await storeUpload(file);

  let amountCents: number | null = null;
  if (kind === "PRESUPUESTO" && amountRaw) {
    const parsed = Number(amountRaw.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error("Importe no válido.");
    }
    amountCents = Math.round(parsed * 100);
  }

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
            ? `${user.name} adjuntó presupuesto “${file.name}” (${(amountCents / 100).toFixed(2)} €).`
            : `${user.name} adjuntó ${kind.toLowerCase()} “${file.name}”.`,
      },
    }),
    prisma.expediente.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    }),
  ]);

  touchPaths(id);
}
