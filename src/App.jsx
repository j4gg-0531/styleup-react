
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth.js';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import DashboardCliente from './pages/cliente/DashboardCliente';
import Agendar from './pages/cliente/Agendar';
import DashboardBarbero from './pages/barbero/DashboardBarbero';
import Horarios from './pages/barbero/Horarios';

// Componente que protege rutas: si no hay sesión, redirige al login
function RutaProtegida({ children, rol }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (rol && user.rol !== rol) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Landing />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas de cliente */}
          <Route path="/cliente" element={
            <RutaProtegida rol="cliente"><DashboardCliente /></RutaProtegida>
          } />
          <Route path="/cliente/agendar" element={
            <RutaProtegida rol="cliente"><Agendar /></RutaProtegida>
          } />

          {/* Rutas de barbero */}
          <Route path="/barbero" element={
            <RutaProtegida rol="barbero"><DashboardBarbero /></RutaProtegida>
          } />
          <Route path="/barbero/horarios" element={
            <RutaProtegida rol="barbero"><Horarios /></RutaProtegida>
          } />

          {/* Cualquier ruta desconocida va al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}