import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import App from './App.tsx'
import { Auth0ProviderWithConfig } from './auth/Auth0Provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <Auth0ProviderWithConfig>
        <App />
      </Auth0ProviderWithConfig>
    </MantineProvider>
  </StrictMode>,
)
