# VigiAPP web

Frontend React y Vite de VigiAPP. La aplicación usa los datos de ejemplo si `VITE_API_URL` está vacío y la API real cuando apunta al backend NestJS.

## Inicio local con backend

1. Preparar MariaDB y la API según el README de `api-vigiapp`.
2. Crear `.env.local` con `VITE_API_URL=http://localhost:3000/api`.
3. Ejecutar `npm install` y `npm run dev`.
4. Registrar dos usuarios y abrirlos en perfiles de navegador distintos. Uno crea un grupo circular e invita al otro. El invitado acepta desde «Mis grupos». Con ambos conectados, un SOS válido genera una alerta en la otra sesión y actualiza el mapa sin recargar.

La sesión real usa el JWT que devuelve `/auth/login`; el backend también coloca una cookie HTTP-only para mostrar imágenes protegidas. El cliente Socket.IO envía el token al conectar. `RoleSwitcher` solo aparece en modo mock. Las páginas públicas de ingreso, registro y contacto usan la API real cuando está configurada.

Los mosaicos de OpenStreetMap pueden necesitar Internet aunque la API y MariaDB corran localmente. VigiAPP es una web responsive; no requiere instalación, Web Push ni despliegue público.

Para verificar el código: `npm run build`, `npm run lint` y `npm exec -- tsc --noEmit`.
