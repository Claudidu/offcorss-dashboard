import { HashRouter, Navigate, Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ReportPage from './pages/ReportPage';
import ProductPage from './pages/ProductPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/reporte" element={<ReportPage />} />
        <Route path="/producto/:id" element={<ProductPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
}