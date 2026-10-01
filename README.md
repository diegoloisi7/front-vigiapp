# VigiAPP · Frontend

Frontend web inicial de VigiAPP, una aplicación académica para compartir información de seguridad vecinal.

## Stack

- React + TypeScript
- Vite
- Leaflet + OpenStreetMap

## Ejecutar

Requiere Node.js y npm.

```bash
npm install
npm run dev
```

Para generar la versión de producción: `npm run build`.

## Organización

```text
src/
  app/                 composición y entrada de la aplicación
  pages/               pantallas
  features/incidents/  tipos, datos y componentes de incidentes
  styles.css           estilos globales y diseño adaptable
```

La pantalla de incidentes usa datos de ejemplo locales. Se reemplazarán por servicios HTTP cuando esté disponible la API NestJS. La URL base se configura con `VITE_API_URL` (ver `.env.example`). La PWA, la autenticación y las actualizaciones en tiempo real quedan para etapas posteriores, siguiendo el orden de desarrollo acordado.

El mapa consume teselas de OpenStreetMap y requiere conexión a internet.
