import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const ICONOS = { exito: '✓', error: '✕', info: 'ℹ' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const cerrar = useCallback((id) => setToasts((lista) => lista.filter((t) => t.id !== id)), []);

  const mostrar = useCallback(
    (tipo, mensaje) => {
      const id = Date.now() + Math.random();
      setToasts((lista) => [...lista, { id, tipo, mensaje }]);
      setTimeout(() => cerrar(id), tipo === 'error' ? 8000 : 5000);
    },
    [cerrar]
  );

  const acciones = useMemo(
    () => ({
      exito: (mensaje) => mostrar('exito', mensaje),
      error: (mensaje) => mostrar('error', mensaje),
      info: (mensaje) => mostrar('info', mensaje),
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={acciones}>
      {children}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tipo}`} role={t.tipo === 'error' ? 'alert' : 'status'}>
            <span className="toast__icono" aria-hidden="true">
              {ICONOS[t.tipo]}
            </span>
            <p>{t.mensaje}</p>
            <button type="button" className="toast__cerrar" onClick={() => cerrar(t.id)} aria-label="Cerrar mensaje">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
