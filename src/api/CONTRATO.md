# Contrato del frontend con la API NestJS

Base: `VITE_API_URL=http://localhost:3000/api`. Las rutas se implementan en `api-vigiapp`; esta lista describe las llamadas reales de [`real.ts`](real.ts).

| Recurso | Rutas |
|---|---|
| Categorías | `GET /categorias` |
| Incidencias | `GET /incidencias`, `GET /incidencias/mias`, `GET /incidencias/:id`, `POST /incidencias`, `POST /incidencias/urgentes`, `PATCH /incidencias/:id`, `PATCH /incidencias/:id/estado`, `POST` y `DELETE /incidencias/:id/confirmaciones`, `POST /incidencias/:id/ya-resuelto` |
| Avisos | `GET /avisos`, `GET /avisos/mios`, `POST /avisos`, `PATCH /avisos/:id`, `POST /avisos/:id/cierre` |
| Grupos | `GET /grupos/mios`, `GET /grupos/:id`, `POST /grupos`, `POST /grupos/:id/invitaciones`, `DELETE /grupos/:id/invitaciones/:invId` |
| Invitaciones | `GET /invitaciones/mias`, `POST /invitaciones/:id/respuesta` |
| Administración | `/admin/estadisticas`, `/admin/grupos`, `/admin/usuarios`, `/admin/incidencias/:id`, `/admin/avisos/:id`, `/admin/categorias`, `/admin/contactos` |

Ingreso, registro, cambio y restablecimiento de contraseña usan `/auth/*`; el contacto público usa `POST /contactos`. El servidor guarda y lista notificaciones en `/notificaciones` y emite `incident:urgent` mediante Socket.IO. Las operaciones con credenciales usan JWT Bearer; el login también crea una cookie HTTP-only para imágenes protegidas.

La creación de grupos envía `name`, `description`, `centerLatitude`, `centerLongitude` y `radiusMeters` al backend. El resto del contrato de React utiliza los campos en español definidos en `src/types/index.ts`. Las incidencias normales requieren coordenadas y pueden adjuntar una foto de hasta 5 MB. El SOS solo se envía con ubicación válida dentro del círculo del grupo.

Los estados y plazos de vencimiento del frontend siguen siendo reglas provisionales del producto. El backend deriva `EXPIRADO` durante la lectura; no cambia automáticamente el estado almacenado.
