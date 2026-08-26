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

        {/* Rutas Base Protegidas (Requiere solo autenticación) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Módulo Accesos */}
        <Route element={<ProtectedRoute requiredPrivilege={{ codigo: 'ACC', nivel: 'L' }} />}>
          <Route path="/accesos" element={<AccesosPage />} />
        </Route>

        {/* Módulo Operaciones */}
        <Route element={<ProtectedRoute requiredPrivilege={{ codigo: 'OPE', nivel: 'L' }} />}>
          <Route path="/operaciones" element={<OperacionesPage />} />
        </Route>

        {/* Módulo Personas */}
        <Route element={<ProtectedRoute requiredPrivilege={{ codigo: 'PER', nivel: 'L' }} />}>
          <Route path="/personas" element={<PersonasPage />} />
        </Route>

        {/* Módulo Ítems */}
        <Route element={<ProtectedRoute requiredPrivilege={{ codigo: 'ITM', nivel: 'L' }} />}>
          <Route path="/items" element={<ItemsPage />} />
        </Route>

        {/* Módulo Estaciones */}
        <Route element={<ProtectedRoute requiredPrivilege={{ codigo: 'EST', nivel: 'L' }} />}>
          <Route path="/estaciones" element={<EstacionesPage />} />
        </Route>

        {/* Módulo Roles y Permisos */}
        <Route element={<ProtectedRoute requiredPrivilege={{ codigo: 'ROL', nivel: 'L' }} />}>
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/roles/nuevo" element={<CrearRolPage />} />
        </Route>

        {/* Módulo Auditoría */}
        <Route element={<ProtectedRoute requiredPrivilege={{ codigo: 'AUD', nivel: 'L' }} />}>
          <Route path="/auditoria" element={<AuditoriaPage />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

