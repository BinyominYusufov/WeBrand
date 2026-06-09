/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Django API. Defaults to http://localhost:8000 in code. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
