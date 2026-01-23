import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import NewProcess from './pages/NewProcess';
import ProcessDetails from './pages/ProcessDetails';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import { WorkflowProvider } from './context/WorkflowContext';

function App() {
  return (
    <WorkflowProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<NewProcess />} />
            <Route path="process/:id" element={<ProcessDetails />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkflowProvider>
  );
}

export default App;
