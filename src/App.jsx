// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificacionesProvider } from './context/NotificacionesContext.jsx';
import { CitasProvider } from './context/CitasContext.jsx';
import { HorariosProvider } from './context/HorariosContext.jsx';
import { ChatFlotanteProvider } from './context/ChatFlotanteContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ToastContainer from './components/ui/ToastContainer.jsx';
import { useAuth } from './context/useAuth.js';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import DashboardCliente from './pages/cliente/DashboardCliente';
import Agendar from './pages/cliente/Agendar';
import Barberos from './pages/cliente/Barberos';
import PerfilBarbero from './pages/cliente/PerfilBarbero';
import DashboardBarbero from './pages/barbero/DashboardBarbero';
import Horarios from './pages/barbero/Horarios';
import Historial from './pages/cliente/Historial';
import Perfil from './pages/cliente/Perfil';
import Telegram from './pages/cliente/Telegram';
import HistorialBarbero from './pages/barbero/HistorialBarbero';
import Servicios from './pages/barbero/Servicios';   // ← antes Precios
import Reportes from './pages/barbero/Reportes';
import PerfilBarberoPage from './pages/barbero/PerfilBarberoPage';
import DashboardBarberia from './pages/barberia/DashboardBarberia';
import BarberosBarberia from './pages/barberia/Barberos';
import Ofertas from './pages/barberia/Ofertas';
import HorariosBarberia from './pages/barberia/HorariosBarberia';
import ReportesBarberia from './pages/barberia/ReportesBarberia';
import PerfilBarberia from './pages/barberia/PerfilBarberia';
import ServiciosBarberia from './pages/barberia/ServiciosBarberia';
import OfertasBarbero from './pages/barbero/OfertasBarbero';
import MiHojaDeVida from './pages/barbero/MiHojaDeVida';
import ChatFlotante from './components/chat/ChatFlotante.jsx';
import ThemeToggle from './components/ui/ThemeToggle.jsx';
import PerfilBarberoAdmin from './pages/barberia/PerfilBarberoAdmin';
import Notificaciones from './pages/Notificaciones';

function RutaProtegida({ children, rol }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (rol && user.rol !== rol) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <NotificacionesProvider>
        <CitasProvider>
          <HorariosProvider>
            <ChatFlotanteProvider>
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
                <Route path="/cliente/barberos" element={
                  <RutaProtegida rol="cliente"><Barberos /></RutaProtegida>
                } />
                <Route path="/cliente/barberos/:id" element={
                  <RutaProtegida rol="cliente"><PerfilBarbero /></RutaProtegida>
                } />
                <Route path="/cliente/historial" element={
                  <RutaProtegida rol="cliente"><Historial /></RutaProtegida>
                } />
                <Route path="/cliente/perfil" element={
                  <RutaProtegida rol="cliente"><Perfil /></RutaProtegida>
                } />
                <Route path="/cliente/telegram" element={
                  <RutaProtegida rol="cliente"><Telegram /></RutaProtegida>
                } />
                <Route path="/cliente/notificaciones" element={
                  <RutaProtegida rol="cliente"><Notificaciones /></RutaProtegida>
                } />

                <Route path="/barbero" element={
                  <RutaProtegida rol="barbero"><DashboardBarbero /></RutaProtegida>
                } />
                <Route path="/barbero/horarios" element={
                  <RutaProtegida rol="barbero"><Horarios /></RutaProtegida>
                } />
                <Route path="/barbero/historial" element={
                  <RutaProtegida rol="barbero"><HistorialBarbero /></RutaProtegida>
                } />
                {/* Ruta /barbero/precios se mantiene igual — solo cambia el componente */}
                <Route path="/barbero/precios" element={
                  <RutaProtegida rol="barbero"><Servicios /></RutaProtegida>
                } />
                <Route path="/barbero/reportes" element={
                  <RutaProtegida rol="barbero"><Reportes /></RutaProtegida>
                } />
                <Route path="/barbero/perfil" element={
                  <RutaProtegida rol="barbero"><PerfilBarberoPage /></RutaProtegida>
                } />
                <Route path="/barbero/hoja-de-vida" element={
                  <RutaProtegida rol="barbero"><MiHojaDeVida /></RutaProtegida>
                } />
                <Route path="/barbero/ofertas" element={
                  <RutaProtegida rol="barbero"><OfertasBarbero /></RutaProtegida>
                } />
                <Route path="/barbero/notificaciones" element={
                  <RutaProtegida rol="barbero"><Notificaciones /></RutaProtegida>
                } />

                <Route path="/barberia" element={
                  <RutaProtegida rol="barberia"><DashboardBarberia /></RutaProtegida>
                } />
                <Route path="/barberia/barberos" element={
                  <RutaProtegida rol="barberia"><BarberosBarberia /></RutaProtegida>
                } />
                <Route path="/barberia/ofertas" element={
                  <RutaProtegida rol="barberia"><Ofertas /></RutaProtegida>
                } />
                <Route path="/barberia/horarios" element={
                  <RutaProtegida rol="barberia"><HorariosBarberia /></RutaProtegida>
                } />
                <Route path="/barberia/reportes" element={
                  <RutaProtegida rol="barberia"><ReportesBarberia /></RutaProtegida>
                } />
                <Route path="/barberia/perfil" element={
                  <RutaProtegida rol="barberia"><PerfilBarberia /></RutaProtegida>
                } />
                <Route path="/barberia/servicios" element={
                  <RutaProtegida rol="barberia"><ServiciosBarberia /></RutaProtegida>
                } />
                <Route path="/barberia/barberos/:id" element={
                  <RutaProtegida rol="barberia"><PerfilBarberoAdmin /></RutaProtegida>
                } />
                <Route path="/barberia/notificaciones" element={
                  <RutaProtegida rol="barberia"><Notificaciones /></RutaProtegida>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ChatFlotante />
              <ThemeToggle />
              <ToastContainer />
            </BrowserRouter>
            </ChatFlotanteProvider>
          </HorariosProvider>
        </CitasProvider>
      </NotificacionesProvider>
      </ToastProvider>
    </AuthProvider>
  );
}