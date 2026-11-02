import { useEffect } from 'react';

// Cada pantalla tiene su propio título (ayuda a lectores de pantalla y a la navegación del navegador)
export function usePageTitle(titulo) {
  useEffect(() => {
    document.title = `${titulo} | Events`;
  }, [titulo]);
}
