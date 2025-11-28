import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './app/layouts/MainLayout';
import { AuthLayout } from './app/layouts/AuthLayout';
import { Login } from './app/routes/Login';
import { Dashboard } from './app/routes/Dashboard';
import { CalendarView } from './app/routes/Calendar';
import { Appointments } from './app/routes/Appointments';
import { Settings } from './app/routes/Settings';
import { useAuthStore } from './app/store/authStore';
import { ToastProvider } from './components/ui/Toast';
import { NotificationProvider } from './components/notifications/NotificationProvider';

function App() {
  const { loadProfile } = useAuthStore();

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <ToastProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
