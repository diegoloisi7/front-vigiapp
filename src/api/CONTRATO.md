# Contrato de la API (propuesta para el backend en Next)

Base: `VITE_API_URL` (ej. `http://localhost:3000/api`). JSON en ambos sentidos. Sesión por cookie (`credentials: 'include'`).
Los errores devuelven `{ "mensaje": "texto" }` con el código HTTP correspondiente.

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/categorias` | `Categoria[]` |
| GET | `/incidencias` | `Incidencia[]` (las del/los grupo/s del usuario) |
| GET | `/incidencias/mias` | `Incidencia[]` (las creadas por el usuario) |
| GET | `/incidencias/:id` | `Incidencia` · 404 si no existe |
| POST | `/incidencias/:id/confirmaciones` | `Incidencia` actualizada · 409 si está cerrada |
| POST | `/incidencias` | `Incidencia` creada. Body: `{ titulo, categoriaId, descripcion, ubicacion }` |
| GET | `/alertas` | `Alerta[]` |
| GET | `/avisos` | `Aviso[]` |

Los tipos (`Incidencia`, `Alerta`, `Aviso`, `Categoria`) están en `src/types/index.ts`.
Fechas en formato ISO 8601. Si el front corre en otro origen, el back debe habilitar CORS con credenciales.

## Grupos e invitaciones

Los listados de `incidencias`, `alertas` y `avisos` aceptan `?grupoId=` (grupo activo del vecino). Sin ese parámetro, el administrador global recibe todo.
Reglas: el creador de un grupo es su **owner**; un usuario puede pertenecer a **varios** grupos; solo el owner invita.

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/grupos/mios` | `GrupoVecinal[]` (incluye `miRol`: `OWNER` o `MIEMBRO`) |
| GET | `/grupos/:id` | `GrupoDetalle` (miembros; `invitaciones` solo si es owner) · 404 / 403 si no pertenece |
| POST | `/grupos` | `GrupoVecinal` creado, con el usuario como owner. Body: `{ nombre, zona }` · 400 si es inválido |
| POST | `/grupos/:id/invitaciones` | `InvitacionGrupo`. Body: `{ email }` · 403 si no es owner · 409 si ya hay una pendiente |
| DELETE | `/grupos/:id/invitaciones/:invId` | 204 · solo owner · 409 si ya fue respondida |
| GET | `/invitaciones/mias` | `InvitacionGrupo[]` pendientes recibidas por el usuario (por email) |
| POST | `/invitaciones/:id/respuesta` | Body: `{ aceptar: boolean }`. Si acepta devuelve el `GrupoVecinal`; si rechaza, 204 · 409 si ya fue respondida |

Para el esquema de datos: `group_memberships` debe permitir varias filas por usuario (único por `user_id + group_id`) y su rol debe ser `OWNER` / `MIEMBRO`.

## Incidentes: tipos y ciclo de vida

Tipos: `URGENTE` (sin campos obligatorios, toma la ubicación en vivo, dura 24 h) y `NORMAL` (título, categoría, descripción y ubicación obligatorios, con vigencia elegida).
Estados: `REPORTADO` → `EN_SEGUIMIENTO` → `RESUELTO` / `DESCARTADO`; si vence `fechaExpiracion` sin cerrarse pasa a `EXPIRADO` (lo hace el backend). Los estados finales no admiten cambios.
Pueden actualizar o cerrar un incidente **su creador (`autorId`) y el owner de su grupo**. La API informa `yoConfirme` y `yoMarqueResuelto` para el usuario actual.

| Método | Ruta | Detalle |
|---|---|---|
| POST | `/incidencias` | Incidente normal. Body: `{ titulo, categoriaId, descripcion, ubicacion, grupoId, vigenciaDias }` |
| POST | `/incidencias/urgentes` | Reporte urgente. Body: `{ lat, lng, grupoId }` (`lat`/`lng` pueden ser `null`) |
| PATCH | `/incidencias/:id` | Editar datos. Body: `{ titulo?, categoriaId?, descripcion?, ubicacion? }` · 403 si no es creador ni owner · 409 si está cerrado |
| PATCH | `/incidencias/:id/estado` | Body: `{ estado, nota? }` · 409 si la transición no es válida |
| POST | `/incidencias/:id/confirmaciones` | "Yo también lo vi" · 409 si ya confirmó o está cerrado |
| POST | `/incidencias/:id/ya-resuelto` | "Ya lo vi resuelto" · 409 si ya lo marcó o está cerrado |

Con 3 o más "ya lo vi resuelto" el front le sugiere al owner cerrarlo (no se cierra solo).
Para el esquema de datos: en `incidents` hacen falta `autor` (user_id), `expires_at`, el contador de "ya lo vi resuelto", y tablas de confirmaciones por usuario (lo vi / ya lo vi resuelto) y de historial de estados.
