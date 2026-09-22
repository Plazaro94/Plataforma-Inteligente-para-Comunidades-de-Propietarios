# Decisiones de producto (v1)

Documento vivo. Refleja lo acordado antes de construir el esqueleto.

## Problema que resolvemos

Falta de comunicación, de acción y de memoria en la comunidad.
La app debe hacer visibles los asuntos, asignar responsable y dejar trazabilidad
para que no se puedan “perder” los problemas.

## Piloto

- Primera comunidad: la vuestra (uso real).
- Todavía no se ha hablado con presidente/administrador externos.

## Roles y gobierno (v1)

- Todos los vecinos pueden **crear** incidencias.
- Todos los vecinos pueden **ver** todas las incidencias (transparencia total).
- Quien mueva el día a día puede ser presidente, administración u otra persona
  de la comunidad (ej. alguien que ejerce por buena fe). El sistema exige
  **responsable**, no un cargo concreto.
- El “acorralar” es visible para toda la comunidad al inicio.
  Más adelante se podrá restringir por configuración.

## Alcance del esqueleto / MVP

Incluye:

1. Comunidad + miembros + roles
2. Acceso por **invitación**
3. Reportar incidencia (texto + foto)
4. Expediente con estados simples + responsable + siguiente acción
5. Timeline / historial
6. Avisos cuando algo lleva días sin movimiento
7. Adjuntos: fotos, documentos y presupuestos
8. Proveedores como ficha (sin login); actuaciones registradas “en su nombre”

Fuera de v1 (después):

- Portal de proveedor con cuenta propia
- Juntas / actas / votaciones
- IA avanzada
- Marketplace
- Multi-comunidad por usuario (modelo preparado, UI de una sola comunidad)
- App nativa en stores (empezamos como PWA web)

## Datos del edificio

- **Ubicación (v1):** texto libre (+ zona opcional simple).
  Ejemplo: “Garaje · puerta entrada”.
- **Activos (después):** elementos físicos con ficha propia
  (ascensor, puerta de garaje, bomba…).
  En v1 se pueden mencionar en el texto; más adelante se vinculan a fichas.

## Acceso y login (recomendación adoptada)

- Acceso por **invitación** (o email bootstrap del primer gestor)
- Login: **enlace mágico por email** (Auth.js)
- En desarrollo el enlace se muestra en pantalla (sin SMTP)
- Idioma: **español primero**, estructura preparada para más idiomas.

## Marca y diseño

- Nombre: pendiente (placeholder interno: `comunidad-app`).
- Visual: claro, limpio, móvil primero, sin ambigüedad.
- PWA: web instalable en el móvil como acceso directo tipo app.
- Hosting previsto: Vercel.
- Base de datos: PostgreSQL (Docker en local, Neon/Vercel en producción).
- Umbral de “parado”: **3 días** sin `lastActivityAt`.
- Adjuntos locales en `/uploads`; en producción se puede usar Vercel Blob.

## Principios no negociables (v1)

1. Mobile-first.
2. Transparencia total dentro de la comunidad.
3. Todo asunto tiene responsable + estado + siguiente acción.
4. Todo queda en el historial.
5. Un dato se introduce una vez.
6. La complejidad queda detrás.
