-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'VECINO',
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membership_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VECINO',
    "token" TEXT NOT NULL,
    "acceptedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "communityId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    CONSTRAINT "Zone_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "communityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Provider_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expediente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locationText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NUEVA',
    "priority" TEXT NOT NULL DEFAULT 'MEDIA',
    "nextAction" TEXT,
    "blockedReason" TEXT,
    "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "communityId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "zoneId" TEXT,
    "providerId" TEXT,
    CONSTRAINT "Expediente_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Expediente_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expediente_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Membership" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expediente_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expediente_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpedienteEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metaJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expedienteId" TEXT NOT NULL,
    "actorId" TEXT,
    CONSTRAINT "ExpedienteEvent_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExpedienteEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL DEFAULT 'OTRO',
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT,
    "amountCents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expedienteId" TEXT NOT NULL,
    CONSTRAINT "Attachment_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");

-- CreateIndex
CREATE INDEX "Membership_communityId_idx" ON "Membership"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_communityId_key" ON "Membership"("userId", "communityId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_communityId_email_idx" ON "Invitation"("communityId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_communityId_name_key" ON "Zone"("communityId", "name");

-- CreateIndex
CREATE INDEX "Provider_communityId_idx" ON "Provider"("communityId");

-- CreateIndex
CREATE INDEX "Expediente_communityId_status_idx" ON "Expediente"("communityId", "status");

-- CreateIndex
CREATE INDEX "Expediente_assigneeId_idx" ON "Expediente"("assigneeId");

-- CreateIndex
CREATE INDEX "Expediente_lastActivityAt_idx" ON "Expediente"("lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "Expediente_communityId_reference_key" ON "Expediente"("communityId", "reference");

-- CreateIndex
CREATE INDEX "ExpedienteEvent_expedienteId_createdAt_idx" ON "ExpedienteEvent"("expedienteId", "createdAt");

-- CreateIndex
CREATE INDEX "Attachment_expedienteId_idx" ON "Attachment"("expedienteId");
