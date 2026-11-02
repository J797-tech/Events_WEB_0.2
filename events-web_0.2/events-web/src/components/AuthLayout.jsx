function Check() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="10" fill="#e6b450" />
      <path d="M5.5 10.5l3 3 6-6.5" fill="none" stroke="#0a2e2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Pantallas de acceso: formulario a la derecha y un panel de contexto a la izquierda (solo en pantallas anchas)
export default function AuthLayout({ titulo, subtitulo, pie, children }) {
  return (
    <div className="acceso">
      <section className="acceso__formulario">
        <h1>{titulo}</h1>
        {subtitulo && <p className="texto-suave">{subtitulo}</p>}
        {children}
        {pie && <p className="acceso__pie">{pie}</p>}
      </section>

      <aside className="acceso__lateral">
        <p className="acceso__lema">Encuentra tu próximo evento y reserva tu cupo.</p>
        <p>Los eventos de la universidad, reunidos en un solo lugar.</p>
        <ul className="acceso__ventajas">
          <li>
            <Check />
            Inscríbete con un clic.
          </li>
          <li>
            <Check />
            Mira los cupos libres al instante.
          </li>
          <li>
            <Check />
            Cancela tu inscripción cuando quieras.
          </li>
        </ul>
      </aside>
    </div>
  );
}
