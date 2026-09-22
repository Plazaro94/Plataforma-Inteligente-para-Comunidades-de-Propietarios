import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMembershipOrNull } from "@/lib/session";
import { readLocalUpload } from "@/lib/storage";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const ctx = await getMembershipOrNull();
  if (!ctx) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const attachment = await prisma.attachment.findFirst({
    where: {
      id,
      expediente: { communityId: ctx.community.id },
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (attachment.url) {
    return NextResponse.redirect(attachment.url);
  }

  try {
    const data = await readLocalUpload(attachment.storageKey);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `inline; filename="${attachment.fileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no disponible" }, { status: 404 });
  }
}
