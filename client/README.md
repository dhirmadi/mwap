# MWAP Client

Modern web application client built with React, TypeScript, and Vite.

## Features

- **React 18**: Latest React features and improvements
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast development server and optimized builds
- **Auth0**: Secure authentication with PKCE flow
- **Mantine UI**: Modern UI components and theming
- **React Router**: Client-side routing
- **Axios**: Type-safe API client

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy example environment file
   cp .env.example .env

   # Fill in the values:
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=your-api-identifier
   VITE_API_URL=http://localhost:54014/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Auth0 Integration

The application uses Auth0 for authentication with the following features:

- Authorization Code flow with PKCE
- Automatic token refresh
- Secure token storage
- Profile management
- Role-based access control

### Auth0 Setup

1. Create an Auth0 application (Single Page Application)
2. Configure the following URLs:
   ```
   Allowed Callback URLs:
   - http://localhost:5173
   - https://*.herokuapp.com

   Allowed Logout URLs:
   - http://localhost:5173
   - https://*.herokuapp.com

   Allowed Web Origins:
   - http://localhost:5173
   - https://*.herokuapp.com
   ```

3. Enable the following features:
   - PKCE (default for SPAs)
   - Refresh Tokens
   - ID Tokens

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
