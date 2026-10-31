import { USAR_MOCK } from './config'
import { apiMock } from './mock'
import { apiReal } from './real'
import type { Api } from './tipos'

// Punto único de acceso a los datos. Con VITE_API_URL usa el backend; sin ella, los datos de ejemplo.
export const api: Api = USAR_MOCK ? apiMock : apiReal
