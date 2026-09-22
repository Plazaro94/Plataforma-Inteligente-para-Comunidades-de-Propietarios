# Deploy en Vercel (web pública desde GitHub)

La app no se ve sola en GitHub: hay que publicarla (recomendado: Vercel).
La base de datos está en **Neon** (proyecto ya vinculado en este repo).

## Neon (ya hecho en local)

- Proyecto: `curly-resonance-94421259`
- Branch: `production` (región EU Central)
- `DATABASE_URL` vive en `.env` (no se sube a GitHub)
- Esquema Prisma ya migrado a Neon

## Publicar en Vercel

1. En [vercel.com](https://vercel.com) → **Add New Project** → importa
   `Plazaro94/Plataforma-Inteligente-para-Comunidades-de-Propietarios`.
2. Añade variables de entorno (copia desde tu `.env` local):

```text
DATABASE_URL=...
DATABASE_URL_UNPOOLED=...
AUTH_SECRET=...
AUTH_URL=https://TU-PROYECTO.vercel.app
BOOTSTRAP_ADMIN_EMAIL=tu@email.com
```

3. Deploy. En 1–2 minutos tendrás la URL pública.
4. Abre `https://TU-PROYECTO.vercel.app/entrar` con el email bootstrap.

Sin SMTP configurado, tras pedir el enlace verás un botón **Abrir enlace mágico** en la propia web.
