import api from './api.js';

// Descarga un CSV desde la API (necesita el token, por eso no es un simple enlace)
export async function descargarCSV(params) {
  try {
    const respuesta = await api.get('/reports/export', { params, responseType: 'blob' });
    const disposicion = respuesta.headers['content-disposition'] || '';
    const nombre = /filename="?([^";]+)"?/.exec(disposicion)?.[1] || 'reporte.csv';

    const url = URL.createObjectURL(respuesta.data);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    // Con responseType blob, el JSON de error llega como Blob: se vuelve a leer para mostrar el mensaje
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        /* se deja el error genérico */
      }
    }
    throw error;
  }
}
