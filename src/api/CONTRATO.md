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
| GET | `/avisos` | `Aviso[]` (del grupo; acepta `?grupoId=`) |
| GET | `/avisos/mios` | `Aviso[]` (los creados por el usuario) |
| POST | `/avisos` | `Aviso` creado. Body: `{ titulo, cuerpo, prioridad, vigenciaDias, grupoId }` (`vigenciaDias: null` = sin vencimiento) · 403 si no pertenece al grupo |
| PATCH | `/avisos/:id` | Editar. Body: `{ titulo?, cuerpo?, prioridad? }` · 403 si no es creador ni owner del grupo · 409 si está cerrado |
| POST | `/avisos/:id/cierre` | Cerrar el aviso · mismos 403 / 409 |

Los tipos (`Incidencia`, `Alerta`, `Aviso`, `Categoria`) están en `src/types/index.ts`.
Fechas en formato ISO 8601. Si el front corre en otro origen, el back debe habilitar CORS con credenciales.

## Grupos e invitaciones

Los listados de `incidencias` y `avisos` aceptan `?grupoId=` (grupo activo del vecino). Sin ese parámetro, el administrador global recibe todo.
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
| POST | `/incidencias` | Incidente normal. Body: `{ titulo, categoriaId, descripcion, ubicacion, lat?, lng?, grupoId, vigenciaDias }`. Si el usuario adjunta foto, se envía como `multipart/form-data` con los mismos campos más el archivo `foto` (imagen, máx. 5 MB). La `Incidencia` devuelta trae `fotoUrl` (URL de la imagen, o `null` si no tiene) |
| POST | `/incidencias/urgentes` | Reporte urgente. Body: `{ lat, lng, grupoId }` (`lat`/`lng` pueden ser `null`) |
| PATCH | `/incidencias/:id` | Editar datos. Body: `{ titulo?, categoriaId?, descripcion?, ubicacion? }` · 403 si no es creador ni owner · 409 si está cerrado |
| PATCH | `/incidencias/:id/estado` | Body: `{ estado, nota? }` · 409 si la transición no es válida |
| POST | `/incidencias/:id/confirmaciones` | "Yo también lo vi" · 409 si ya confirmó o está cerrado |
| POST | `/incidencias/:id/ya-resuelto` | "Ya lo vi resuelto" · 409 si ya lo marcó o está cerrado |

"Ya lo vi resuelto" es solo un contador informativo: no cierra ni sugiere nada. Los incidentes se cierran por expiración (urgentes a las 24 h; normales según `vigenciaDias`) o cuando los cierra su creador o el owner del grupo.
Para el esquema de datos: en `incidents` hacen falta `autor` (user_id), `expires_at`, el contador de "ya lo vi resuelto", y tablas de confirmaciones por usuario (lo vi / ya lo vi resuelto) y de historial de estados.


## Alertas y avisos

- **Alerta = reporte urgente** (`tipo: URGENTE`). No tiene endpoint propio: la pantalla Alertas usa `GET /incidencias?grupoId=` y `GET /incidencias/mias`, y filtra por tipo.
- **Avisos**: estados `VIGENTE` → `CERRADO` (lo cierra el creador o el owner del grupo) o `EXPIRADO` (lo hace el backend al pasar `vence`). Cualquier miembro del grupo puede crear avisos.
- Para el esquema de datos: tabla de avisos con `author_id`, `group_id`, `priority`, `status`, `expires_at`.

## Panel de administración (rol ADMINISTRADOR)

El admin global **no pertenece a grupos** y ve todo. **Nunca ve ni define contraseñas.** Todas estas rutas devuelven 403 si el usuario no es admin.
Además puede usar `PATCH /incidencias/:id`, `PATCH /incidencias/:id/estado`, `PATCH /avisos/:id` y `POST /avisos/:id/cierre` sobre cualquier publicación (moderación), y `GET /incidencias` y `GET /avisos` sin `grupoId` devuelven todo.

| Método | Ruta | Detalle |
|---|---|---|
| GET | `/admin/estadisticas` | `EstadisticasAdmin`: totales (grupos, usuarios, vecinos, nuevos 30 días), incidentes por estado, últimos 7 días, por categoría, top de grupos, urgentes activos, avisos vigentes, contactos sin leer |
| GET | `/admin/grupos` | `GrupoAdmin[]` (con cantidad de vecinos, incidentes y avisos) |
| PATCH | `/admin/grupos/:id` | Body: `{ nombre?, zona? }` · 400 si es inválido |
| DELETE | `/admin/grupos/:id` | 204 · borra también sus incidentes y avisos |
| GET | `/admin/usuarios` | `UsuarioAdmin[]` (nunca incluye la contraseña) |
| PATCH | `/admin/usuarios/:id` | Body: `{ nombre?, apellido?, email?, rol? }` · 409 si el email ya existe o si el admin se cambia su propio rol |
| DELETE | `/admin/usuarios/:id` | 204 · 409 si es owner de un grupo o es el propio admin |
| POST | `/admin/usuarios/:id/blanqueo-clave` | 204 · el backend le envía al usuario un enlace para crear una contraseña nueva |
| DELETE | `/admin/incidencias/:id` | 204 |
| DELETE | `/admin/avisos/:id` | 204 |
| POST | `/admin/categorias` | `Categoria` creada. Body: `{ nombre, icono }` · 409 si ya existe |
| PATCH | `/admin/categorias/:id` | Body: `{ nombre?, icono?, activa? }` (las categorías no se borran, se desactivan) |
| GET | `/admin/contactos` | `Contacto[]` (mensajes del formulario de contacto, más nuevos primero) |
| POST | `/admin/contactos/:id/leido` | `Contacto` marcado como leído |

Para el esquema de datos: `users.role`, tabla de mensajes de contacto (`read` booleano) y borrado en cascada de incidentes y avisos al eliminar un grupo.
