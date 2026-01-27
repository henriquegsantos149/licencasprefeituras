import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import NewProcess from './pages/NewProcess';
import ProcessDetails from './pages/ProcessDetails';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { WorkflowProvider } from './context/WorkflowContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import RouteLogger from './components/RouteLogger';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WorkflowProvider>
          <BrowserRouter>
            <RouteLogger />
            <Routes>
              {/* Rota raiz - página inicial é o login */}
              <Route path="/" element={<Login />} />
              
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rotas protegidas - todas dentro do Layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/new" element={<NewProcess />} />
                <Route path="/process/:id" element={<ProcessDetails />} />
                <Route 
                  path="/admin" 
                  element={
                    <RoleProtectedRoute allowedRoles={['licenciador', 'admin']}>
                      <Admin />
                    </RoleProtectedRoute>
                  } 
                />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* Redirecionar rotas desconhecidas para login (página inicial) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </WorkflowProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
