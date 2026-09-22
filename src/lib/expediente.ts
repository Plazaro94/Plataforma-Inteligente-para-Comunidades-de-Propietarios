import type { ExpedienteStatus, Priority } from "@prisma/client";

export const STALE_AFTER_DAYS = 3;

export const expedienteStatuses: ExpedienteStatus[] = [
  "NUEVA",
  "EN_CURSO",
  "BLOQUEADA",
  "RESUELTA",
  "CERRADA",
];

export const priorities: Priority[] = ["BAJA", "MEDIA", "ALTA", "CRITICA"];

export function daysSince(date: Date, now = new Date()) {
  const ms = now.getTime() - date.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function isStalled(lastActivityAt: Date, now = new Date()) {
  return daysSince(lastActivityAt, now) >= STALE_AFTER_DAYS;
}
