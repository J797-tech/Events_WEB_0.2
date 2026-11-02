// Las fechas de los eventos se guardan a medianoche UTC: se muestran en UTC para que no "retrocedan" un día.
export const soloFecha = (iso) => iso.slice(0, 10);

export const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const fechaLarga = (iso) => new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'full', timeZone: 'UTC' });

export const diaYSemana = (iso) => {
  const f = new Date(iso);
  return {
    dia: f.toLocaleDateString('es-CO', { day: 'numeric', timeZone: 'UTC' }),
    semana: f.toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' }).replace('.', ''),
  };
};

// Para marcas de tiempo (fecha de inscripción): zona horaria local
export const fechaLocal = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

// "2026-11" -> "Noviembre de 2026"
export function tituloMes(clave) {
  const [anio, mes] = clave.split('-').map(Number);
  const texto = new Date(Date.UTC(anio, mes - 1, 1)).toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
