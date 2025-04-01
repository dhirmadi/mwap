import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import App from './App.tsx'
import { Auth0ProviderWithConfig } from './auth/Auth0Provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <Notifications />
      <Auth0ProviderWithConfig>
        <App />
      </Auth0ProviderWithConfig>
    </MantineProvider>
  </StrictMode>,
)
