# Esquema de dominio (v1)

## Entidades

```text
User (persona)
  └── Membership (usuario ↔ comunidad + rol)
        └── Community
              ├── Invitation
              ├── Expediente (incidencia / asunto)
              │     ├── ExpedienteEvent (timeline / auditoría)
              │     └── Attachment (foto, PDF, presupuesto…)
              ├── Provider (ficha, sin login en v1)
              └── Zone (opcional, etiqueta simple)
```

## Roles

- VECINO
- PRESIDENTE
- VICEPRESIDENTE
- ADMIN_FINCAS
- GESTOR (quien opera el día a día aunque no sea el cargo formal)

## Estados del expediente

- NUEVA
- EN_CURSO
- BLOQUEADA
- RESUELTA
- CERRADA

## Campos clave de un expediente

- título / descripción
- ubicación (texto)
- zona (opcional)
- prioridad (BAJA | MEDIA | ALTA | CRITICA)
- estado
- responsable (membership)
- siguiente acción (texto)
- creado por
- fechas (creado, actualizado, sin movimiento desde)
- adjuntos
- eventos

## Flujo mínimo

```text
Vecino reporta (+ foto)
  → se crea Expediente NUEVA
  → evento en timeline
  → se asigna responsable (o queda “sin asignar” visible)
  → la comunidad ve el asunto
  → se actualiza estado / siguiente acción
  → se adjuntan presupuestos/docs
  → se cierra con evidencia
  → queda en historial
```
