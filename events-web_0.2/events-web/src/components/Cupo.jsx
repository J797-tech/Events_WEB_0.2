// Barra de cupos con su texto equivalente (no depende solo del color)
export default function Cupo({ evento }) {
  const agotado = evento.cupoDisponible === 0;
  const casiLleno = !agotado && evento.cupoDisponible / evento.cupo <= 0.2;

  return (
    <>
      <progress
        className={`cupo${agotado || casiLleno ? ' cupo--critico' : ''}`}
        value={evento.inscritos}
        max={evento.cupo}
        aria-label={`${evento.inscritos} de ${evento.cupo} cupos ocupados`}
      />
      <p className="cupo__texto">
        {agotado ? 'Todos los cupos están ocupados' : `${evento.cupoDisponible} de ${evento.cupo} cupos libres`}
      </p>
    </>
  );
}
