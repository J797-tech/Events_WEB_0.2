import { createContext, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  // Al abrir la app, si hay token guardado, recupera la sesión
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api
      .get('/auth/me')
      .then(({ data }) => setUsuario(data.usuario))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  // Sesión vencida (la API respondió 401)
  useEffect(() => {
    const alExpirar = () => {
      setUsuario(null);
      toast.info('Tu sesión expiró. Inicia sesión de nuevo.');
    };
    window.addEventListener('sesion-expirada', alExpirar);
    return () => window.removeEventListener('sesion-expirada', alExpirar);
  }, [toast]);

  // Guarda el token y el usuario (lo usan el login y el registro)
  const entrar = (token, datosUsuario) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUsuario(datosUsuario);
  };

  const login = async (correo, password) => {
    const { data } = await api.post('/auth/login', { correo, password });
    entrar(data.token, data.usuario);
    return data.usuario;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  };

  return <AuthContext.Provider value={{ usuario, cargando, entrar, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
