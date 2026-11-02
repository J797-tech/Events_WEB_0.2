import axios from 'axios';

export const TOKEN_KEY = 'token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 15000,
});

// Envía el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si la sesión venció, limpia el token y avisa a la aplicación
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.startsWith('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('sesion-expirada'));
    }
    return Promise.reject(error);
  }
);

// Convierte cualquier error de Axios en { mensaje, errores, status } listo para mostrar al usuario
export function leerError(error) {
  if (!error.response) {
    return {
      mensaje: 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      errores: [],
    };
  }
  const { mensaje, errores } = error.response.data || {};
  return {
    mensaje: mensaje || 'Ocurrió un error inesperado.',
    errores: errores || [],
    status: error.response.status,
  };
}

export default api;
