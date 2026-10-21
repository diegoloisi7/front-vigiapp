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
