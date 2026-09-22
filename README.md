# Comunidad App

Plataforma web (PWA) para comunidades de propietarios: incidencias visibles,
responsables claros e historial completo.

> Nombre comercial pendiente. Placeholder interno: `comunidad-app`.

## Qué hay ahora (esqueleto)

- Next.js 16 + TypeScript + Tailwind
- Prisma + SQLite (local) → PostgreSQL en producción
- Modelo de dominio: comunidad, miembros/roles, expedientes, eventos, adjuntos, proveedores, invitaciones
- UI mobile-first con navegación inferior
- Flujo demo: listar / crear / ver incidencia + timeline
- Manifest PWA (instalable como acceso directo)
- Decisiones de producto en `docs/DECISIONES.md` y `docs/DOMINIO.md`

## Arranque local

```bash
npm install
npx prisma migrate dev
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

La primera visita crea datos demo (comunidad + una incidencia de ejemplo).

## Próximos ladrillos

1. Invitaciones + login por enlace mágico
2. Subida de fotos / documentos / presupuestos
3. Asignar responsable y cambiar estado desde la UI
4. Avisos de “días sin movimiento”
5. Despliegue en Vercel + Postgres

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build producción
- `npm run lint` — eslint
- `npx prisma studio` — ver base de datos
