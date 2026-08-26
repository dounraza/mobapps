import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import SettingsPage from './SettingsPage';
import SecurityPage from './SecurityPage';
import TransactionList from './TransactionList';
import DashboardHome from './DashboardHome';
import WorkspacePage from './WorkspacePage';
import { NotificationProvider } from './NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="workspace" element={<WorkspacePage />} />
            <Route path="transactions" element={<TransactionList actionType="Depot" />} />
            <Route path="parametres" element={<SettingsPage />} />
            <Route path="securite" element={<SecurityPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
