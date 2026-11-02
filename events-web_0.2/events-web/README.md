# events-web

Frontend de **Events**, la aplicación de gestión de eventos (React + Vite + React Router + Axios).
Se conecta con la API `events-api`.

## Requisitos
Node.js 18 o superior y la API corriendo (local o desplegada).

## Instalación local
1. `npm install`
2. Copia `.env.example` a `.env` y ajusta `VITE_API_URL`.
3. En la API, `FRONTEND_URL` debe ser `http://localhost:5173` (CORS).
4. `npm run dev` y abre http://localhost:5173

## Variables de entorno
| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API, incluyendo `/api` |

Las variables `VITE_*` quedan visibles en el navegador: nunca pongas secretos aquí.

## Pantallas
| Ruta | Pantalla | Acceso |
|---|---|---|
| `/login`, `/registro`, `/registro/exito` | Acceso y código de participante | Público |
| `/eventos` | Agenda con búsqueda y filtros | Con sesión |
| `/eventos/:id` | Detalle, inscripción y cancelación | Con sesión |
| `/mis-inscripciones` | Próximos y anteriores | Estudiante |
| `/admin/eventos/nuevo` | Crear evento | Administrador |
| `/admin/eventos/:id/editar` | Editar evento y su estado | Administrador |
| `/admin/eventos/:id/asistentes` | Lista, búsqueda, quitar y exportar | Administrador |
| `/admin/reportes` | Ocupación, eventos por mes y CSV | Administrador |

## Estructura
```
src/
  components/   Layout, Navbar, AuthLayout, FormField, Loader, Breadcrumbs,
                ConfirmDialog, EventRow, FechaBloque, Cupo, Iconos
  context/      AuthContext (sesión), ToastContext (confirmaciones)
  hooks/        useForm (validación en tiempo real), useDebounce, usePageTitle
  pages/        Login, Register, RegistroExito, Events, EventDetail,
                MyRegistrations, EventFormPage, Attendees, Reports, NotFound
  routes/       ProtectedRoute (sesión y rol)
  services/     api.js (Axios, token e interceptores), descargas.js (CSV)
  styles/       global.css (tokens y componentes)
  utils/        fechas.js
```

## Diseño
- Verde profundo con acento dorado en las acciones principales sobre fondos oscuros; títulos en Fraunces y texto en Plus Jakarta Sans (se cargan desde Google Fonts, con tipografías del sistema como respaldo).
- Los eventos se presentan como una **agenda agrupada por mes**: bloque con el día, hora, lugar y una barra con los cupos ocupados. Cada fila completa es clicable.
- Los colores son variables al inicio de `global.css`: cambiar `--profundo`, `--acento` y `--dorado` recolorea toda la aplicación.

## Accesibilidad e IHC aplicadas
- Enlace "Saltar al contenido", HTML semántico, migas de pan y foco que pasa al contenido en cada cambio de pantalla.
- Etiquetas asociadas a cada campo; errores y ayudas con `aria-describedby`; `aria-invalid`.
- Validación en tiempo real, mensajes junto al campo y foco en el primer error.
- Confirmación antes de acciones destructivas (cancelar inscripción, quitar participante, eliminar evento) con `<dialog>` nativo: bloquea el fondo, atrapa el foco y se cierra con Esc.
- Mensajes de éxito y error (`role="status"` / `role="alert"`) que no dependen solo del color.
- Estados de carga, error con reintento y listas vacías con una acción sugerida.
- Búsqueda con retraso (no consulta en cada tecla) y resultados anunciados a lectores de pantalla.
- Cupos con barra de progreso semántica y texto equivalente; tablas con etiquetas que se apilan en celular.
- Contraste AA, botones táctiles de 44 px, `prefers-reduced-motion` y diseño mobile-first con menú plegable.

## Despliegue (Vercel o Netlify)
- Build: `npm run build` · Carpeta de salida: `dist`
- Variable `VITE_API_URL` con la URL pública de la API.
- `vercel.json` y `public/_redirects` ya incluyen la regla para que las rutas funcionen al recargar.
- Después, actualiza `FRONTEND_URL` en la API con la URL del frontend.
