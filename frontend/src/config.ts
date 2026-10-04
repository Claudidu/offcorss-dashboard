// En desarrollo usa el backend local; en producción, el de Render.
// VITE_API_URL permite cambiarlo sin tocar código.
export const API_URL: string =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD
    ? 'https://offcorss-dashboard-api.onrender.com/graphql'
    : 'http://localhost:4000/graphql');