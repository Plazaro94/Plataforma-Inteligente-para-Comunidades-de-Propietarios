# Comunidad App

Plataforma web (PWA) para comunidades de propietarios: incidencias visibles,
responsables claros e historial completo.

> Nombre comercial pendiente. Placeholder interno: `comunidad-app`.

## Qué hay ahora

- Next.js 16 + TypeScript + Tailwind + PWA
- Prisma + PostgreSQL (local con Docker o Neon)
- Auth por invitación + enlace mágico
- Expedientes: crear, listar, detalle, historial
- Mover asunto: estado, prioridad, responsable, siguiente acción
- Adjuntos: fotos, documentos y presupuestos (+ importe)
- Comentarios visibles para la comunidad
- Aviso de asuntos parados ≥ 3 días
- Decisiones en `docs/DECISIONES.md`, deploy en `docs/DEPLOY.md`

## Arranque local

1. Arranca Postgres:

```bash
docker compose up -d
```

2. Copia `.env.example` a `.env` y ajusta:

```text
DATABASE_URL="postgresql://comunidad:comunidad@localhost:5432/comunidad"
AUTH_SECRET="cambia-esto"
AUTH_URL="http://localhost:3000"
BOOTSTRAP_ADMIN_EMAIL="tu@email.com"
```

3. Instala, migra y arranca:

```bash
npm install
npx prisma migrate deploy
npm run dev
```

4. Entra en [http://localhost:3000/entrar](http://localhost:3000/entrar) con el email bootstrap.
   Sin SMTP verás el enlace mágico en pantalla.

## Próximos ladrillos

1. Ficha de proveedores (actuaciones en su nombre)
2. Despliegue Vercel + Neon (ver `docs/DEPLOY.md`)
3. Notificaciones push / email reales
4. Vercel Blob para archivos en producción (`BLOB_READ_WRITE_TOKEN`)

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build producción (incluye migraciones)
- `npm run lint` — eslint
- `npm run db:studio` — Prisma Studio
- `docker compose up -d` — Postgres local
