# Comunidad App

Plataforma web (PWA) para comunidades de propietarios: incidencias visibles,
responsables claros e historial completo.

> Nombre comercial pendiente. Placeholder interno: `comunidad-app`.

## Qué hay ahora (esqueleto)

- Next.js 16 + TypeScript + Tailwind
- Prisma + SQLite (local) → PostgreSQL en producción
- Modelo de dominio: comunidad, miembros/roles, expedientes, eventos, adjuntos, proveedores, invitaciones
- UI mobile-first con navegación inferior
- Flujo real: login mágico, invitaciones, crear/listar/ver incidencias + timeline
- Manifest PWA (instalable como acceso directo)
- Decisiones de producto en `docs/DECISIONES.md` y `docs/DOMINIO.md`

## Arranque local

1. Copia `.env.example` a `.env` y pon tu email en `BOOTSTRAP_ADMIN_EMAIL`
   (ese email será el primer gestor de “Mi comunidad”).
2. Instala y migra:

```bash
npm install
npx prisma migrate dev
npm run dev
```

3. Abre [http://localhost:3000/entrar](http://localhost:3000/entrar)
4. Entra con el email bootstrap. En desarrollo verás el **enlace mágico** en pantalla
   (no hace falta configurar SMTP todavía).
5. Desde Inicio → **Invitar vecinos** genera enlaces para el resto.

## Auth (v1)

- Acceso solo por invitación (o email bootstrap)
- Login por enlace mágico (Auth.js)
- En local el enlace se muestra en `/entrar/enviado`
- SMTP real opcional con `EMAIL_SERVER` / `EMAIL_FROM`

## Próximos ladrillos

1. Subida de fotos / documentos / presupuestos
2. Asignar responsable y cambiar estado desde la UI
3. Avisos de “días sin movimiento”
4. Despliegue en Vercel + Postgres

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build producción
- `npm run lint` — eslint
- `npx prisma studio` — ver base de datos
