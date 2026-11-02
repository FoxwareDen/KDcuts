# React + TypeScript + Vite what the sigma

## Migrating Neon data to Firebase

The migration script copies rows from the legacy Neon tables `bookings`, `booking_data`, `services`, `calendar`, and `config` into their Firebase collections. It is a dry run unless `--apply` is passed. Re-running it is safe for the same source data: documents use their original IDs and matching destination documents are merged.

Requirements:

- A Neon PostgreSQL connection string (`NEON_DATABASE_URL`), available from the Neon console. The old `VITE_DATABASE_API_URL` is an API URL, not a PostgreSQL connection string.
- Firebase Admin credentials available through Application Default Credentials, for example a service-account JSON file referenced by `GOOGLE_APPLICATION_CREDENTIALS`.
- `FIREBASE_PROJECT_ID`, or the existing `VITE_FIREBASE_PROJECT_ID` in `.env`.

In PowerShell, set the connection string and credentials, then run a dry run:

```powershell
$env:NEON_DATABASE_URL = "postgresql://..."
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\secure\firebase-service-account.json"
npm run migrate:firebase
```

Review the row counts, then run `npm run migrate:firebase -- --apply` to write the data. The script also migrates legacy `booking_data` rows into `bookings_clients` and converts their `booking_id` values to strings, as expected by the Firebase app. Neon Auth accounts and passwords are not migrated.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
