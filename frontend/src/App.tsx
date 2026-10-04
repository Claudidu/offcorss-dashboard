import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ReportPage from './pages/ReportPage';
import ProductPage from './pages/ProductPage';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/reporte" element={<ReportPage />} />
            <Route path="/producto/:id" element={<ProductPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/perfil" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}