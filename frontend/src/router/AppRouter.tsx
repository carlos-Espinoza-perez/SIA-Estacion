import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { AccesosPage } from '../pages/accesos/AccesosPage';
import { OperacionesPage } from '../pages/operaciones/OperacionesPage';
import { PersonasPage } from '../pages/personas/PersonasPage';
import { ItemsPage } from '../pages/items/ItemsPage';
import { EstacionesPage } from '../pages/estaciones/EstacionesPage';
import { RolesPage } from '../pages/roles/RolesPage';
import { CrearRolPage } from '../pages/roles/CrearRolPage';
import { AuditoriaPage } from '../pages/auditoria/AuditoriaPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/"          element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accesos"      element={<AccesosPage />} />
          <Route path="/operaciones"  element={<OperacionesPage />} />
          <Route path="/personas"     element={<PersonasPage />} />
          <Route path="/items"        element={<ItemsPage />} />
          <Route path="/estaciones"   element={<EstacionesPage />} />
          <Route path="/roles"        element={<RolesPage />} />
          <Route path="/roles/nuevo"  element={<CrearRolPage />} />
          <Route path="/auditoria"    element={<AuditoriaPage />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
