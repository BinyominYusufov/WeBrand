// Default in code so the dev server works with no .env; override via VITE_API_URL in prod.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
