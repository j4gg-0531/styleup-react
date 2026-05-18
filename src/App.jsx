// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CitasProvider } from './context/CitasContext.jsx';
import { HorariosProvider } from './context/HorariosContext.jsx';
import { useAuth } from './context/useAuth.js';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import DashboardCliente from './pages/cliente/DashboardCliente';
import Agendar from './pages/cliente/Agendar';
import DashboardBarbero from './pages/barbero/DashboardBarbero';
import Horarios from './pages/barbero/Horarios';

function RutaProtegida({ children, rol }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (rol && user.rol !== rol) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CitasProvider>
        <HorariosProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"          element={<Landing />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/registro"  element={<Registro />} />

              <Route path="/cliente" element={
                <RutaProtegida rol="cliente"><DashboardCliente /></RutaProtegida>
              } />
              <Route path="/cliente/agendar" element={
                <RutaProtegida rol="cliente"><Agendar /></RutaProtegida>
              } />

              <Route path="/barbero" element={
                <RutaProtegida rol="barbero"><DashboardBarbero /></RutaProtegida>
              } />
              <Route path="/barbero/horarios" element={
                <RutaProtegida rol="barbero"><Horarios /></RutaProtegida>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </HorariosProvider>
      </CitasProvider>
    </AuthProvider>
  );
}