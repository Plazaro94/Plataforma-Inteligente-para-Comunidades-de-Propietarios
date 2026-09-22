import { prisma } from "@/lib/db";

/** Demo data for the first community until auth/invites land. */
export async function ensureDemoCommunity() {
  const community = await prisma.community.upsert({
    where: { slug: "residencial-demo" },
    update: {},
    create: {
      name: "Residencial Demo",
      slug: "residencial-demo",
    },
  });

  const ana = await prisma.user.upsert({
    where: { email: "ana@demo.local" },
    update: {},
    create: { email: "ana@demo.local", name: "Ana Vecina" },
  });
  const luis = await prisma.user.upsert({
    where: { email: "luis@demo.local" },
    update: {},
    create: { email: "luis@demo.local", name: "Luis Gestor" },
  });

  await prisma.membership.upsert({
    where: {
      userId_communityId: { userId: ana.id, communityId: community.id },
    },
    update: {},
    create: { userId: ana.id, communityId: community.id, role: "VECINO" },
  });

  const luisMembership = await prisma.membership.upsert({
    where: {
      userId_communityId: { userId: luis.id, communityId: community.id },
    },
    update: {},
    create: { userId: luis.id, communityId: community.id, role: "GESTOR" },
  });

  const existingCase = await prisma.expediente.findFirst({
    where: { communityId: community.id, reference: "INC-001" },
  });

  if (!existingCase) {
    const openCase = await prisma.expediente.create({
      data: {
        reference: "INC-001",
        title: "La puerta del garaje no cierra",
        description:
          "Por las noches la puerta se queda a medio camino. Ya se ha comentado varias veces.",
        locationText: "Garaje · puerta de entrada",
        status: "EN_CURSO",
        priority: "ALTA",
        nextAction: "Pedir presupuesto al proveedor habitual",
        communityId: community.id,
        creatorId: ana.id,
        assigneeId: luisMembership.id,
      },
    });

    await prisma.expedienteEvent.createMany({
      data: [
        {
          expedienteId: openCase.id,
          actorId: ana.id,
          type: "CREADA",
          message: "Ana registró la incidencia.",
        },
        {
          expedienteId: openCase.id,
          actorId: luis.id,
          type: "RESPONSABLE_ASIGNADO",
          message: "Luis quedó como responsable.",
        },
        {
          expedienteId: openCase.id,
          actorId: luis.id,
          type: "SIGUIENTE_ACCION",
          message: "Siguiente acción: pedir presupuesto.",
        },
      ],
    });
  }

  return community;
}
