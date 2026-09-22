# Deploy en Vercel (web pública desde GitHub)

La app no se ve sola en GitHub: hay que publicarla (recomendado: Vercel).

## Pasos rápidos

1. Crea una base **PostgreSQL** gratis en [Neon](https://neon.tech) y copia la connection string.
2. Entra en [Vercel](https://vercel.com) → **Add New Project** → importa
   `Plazaro94/Plataforma-Inteligente-para-Comunidades-de-Propietarios`.
3. Añade variables de entorno:

```text
DATABASE_URL=postgresql://...  (la de Neon)
AUTH_SECRET=...                (cadena larga aleatoria)
AUTH_URL=https://TU-PROYECTO.vercel.app
BOOTSTRAP_ADMIN_EMAIL=tu@email.com
```

4. Deploy. En 1–2 minutos tendrás la URL pública.
5. Abre `https://TU-PROYECTO.vercel.app/entrar` con el email bootstrap.

Sin SMTP configurado, tras pedir el enlace verás un botón **Abrir enlace mágico** en la propia web.
