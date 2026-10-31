import { USAR_MOCK } from './config'
import { apiMock } from './mock'
import { apiReal } from './real'
import type { Api } from './tipos'

// Punto único de acceso a los datos. Usa el backend local salvo que VITE_API_MODE=mock.
export const api: Api = USAR_MOCK ? apiMock : apiReal
