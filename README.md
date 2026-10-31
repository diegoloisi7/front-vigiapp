# VigiAPP web

Frontend React y Vite de VigiAPP. La aplicación se conecta por defecto a la API NestJS local (`http://localhost:3000/api`). Para usar datos de ejemplo sin backend, configurar `VITE_API_MODE=mock` en `.env.local`.

## Inicio local con backend

1. Preparar MariaDB y la API según el README de `api-vigiapp`.
2. Si la API usa otra dirección, crear `.env.local` con `VITE_API_URL` apuntando a su prefijo `/api`. Usar el mismo nombre de host (`localhost` o `127.0.0.1`) en el front y en la API para que las fotos protegidas compartan la cookie de sesión.
3. Ejecutar `npm install` y `npm run dev`.
4. Registrar dos usuarios y abrirlos en perfiles de navegador distintos. Uno crea un grupo circular e invita al otro. El invitado acepta desde «Mis grupos». Con ambos conectados, un SOS válido genera una alerta en la otra sesión y actualiza el mapa sin recargar.

La sesión real usa el JWT que devuelve `/auth/login`; el backend también coloca una cookie HTTP-only para mostrar imágenes protegidas. El cliente Socket.IO envía el token al conectar. `RoleSwitcher` solo aparece en modo mock. Las páginas públicas de ingreso, registro y contacto usan la API real cuando está configurada.

Los mosaicos de OpenStreetMap pueden necesitar Internet aunque la API y MariaDB corran localmente. VigiAPP es una web responsive; no requiere instalación, Web Push ni despliegue público.

Para verificar el código: `npm run build`, `npm run lint` y `npm exec -- tsc --noEmit`.
