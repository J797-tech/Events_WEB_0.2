import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RegistroExito from './pages/RegistroExito.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import MyRegistrations from './pages/MyRegistrations.jsx';
import EventFormPage from './pages/EventFormPage.jsx';
import Attendees from './pages/Attendees.jsx';
import Reports from './pages/Reports.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/eventos" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/registro/exito" element={<RegistroExito />} />

        {/* Cualquier persona con sesión */}
        <Route element={<ProtectedRoute />}>
          <Route path="/eventos" element={<Events />} />
          <Route path="/eventos/:id" element={<EventDetail />} />
        </Route>

        {/* Solo estudiantes */}
        <Route element={<ProtectedRoute rol="estudiante" />}>
          <Route path="/mis-inscripciones" element={<MyRegistrations />} />
        </Route>

        {/* Solo administrador */}
        <Route element={<ProtectedRoute rol="admin" />}>
          <Route path="/admin/eventos/nuevo" element={<EventFormPage />} />
          <Route path="/admin/eventos/:id/editar" element={<EventFormPage />} />
          <Route path="/admin/eventos/:id/asistentes" element={<Attendees />} />
          <Route path="/admin/reportes" element={<Reports />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
