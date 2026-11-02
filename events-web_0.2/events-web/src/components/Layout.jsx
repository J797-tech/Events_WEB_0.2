import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  const principal = useRef(null);
  const primeraCarga = useRef(true);

  // Al cambiar de pantalla, el foco pasa al contenido (útil para teclado y lectores de pantalla)
  useEffect(() => {
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    principal.current?.focus();
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a href="#contenido" className="saltar">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" ref={principal} tabIndex={-1} className="contenedor principal">
        <Outlet />
      </main>
      <footer className="pie">
        <div className="contenedor">Events es un proyecto de la asignatura INGSOFT VII.</div>
      </footer>
    </>
  );
}
