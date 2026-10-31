import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TemaProvider } from './context/TemaContext'
import { CategoriasProvider } from './context/CategoriasContext'
import { GruposProvider } from './context/GruposContext'
import App from './App'

// Orden de estilos: variables → base → layout → componentes
import './styles/variables.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/landing.css'
import './styles/app.css'

// Vista del vecino: fuentes empaquetadas (funcionan sin conexión), tokens y estilos propios
import '@fontsource/overpass/700.css'
import '@fontsource/overpass/800.css'
import '@fontsource/overpass/900.css'
import '@fontsource/atkinson-hyperlegible/400.css'
import '@fontsource/atkinson-hyperlegible/700.css'
import './styles/tokens.css'
import './styles/vecino.css'
import './styles/vecino-pantallas.css'
import './styles/admin.css'
import './styles/animaciones.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TemaProvider>
      <BrowserRouter>
        <AuthProvider>
          <CategoriasProvider>
            <GruposProvider>
              <App />
            </GruposProvider>
          </CategoriasProvider>
        </AuthProvider>
      </BrowserRouter>
    </TemaProvider>
  </StrictMode>,
)
