/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // больше переменных окружения...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
