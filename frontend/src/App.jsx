import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AttendeeHome from './pages/AttendeeHome';
import SOSConfirm from './pages/SOSConfirm';
import AlertSent from './pages/AlertSent';
import HelpPoint from './pages/HelpPoint';
import GuardLogin from './pages/GuardLogin';
import GuardDashboard from './pages/GuardDashboard';
import OrgLogin from './pages/OrgLogin';
import OrgDashboard from './pages/OrgDashboard';
import EventSetup from './pages/EventSetup';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/demo" replace />} />
        <Route path="/demo" element={<Landing />} />
        <Route path="/e/:eventId" element={<Landing />} />
        <Route path="/e/:eventId/home" element={<AttendeeHome />} />
        <Route path="/e/:eventId/sos-confirm" element={<SOSConfirm />} />
        <Route path="/e/:eventId/alert/:alertId" element={<AlertSent />} />
        <Route path="/e/:eventId/helppoint" element={<HelpPoint />} />
        <Route path="/guard/login" element={<GuardLogin />} />
        <Route path="/guard/dashboard" element={<GuardDashboard />} />
        <Route path="/org/login" element={<OrgLogin />} />
        <Route path="/org/dashboard" element={<OrgDashboard />} />
        <Route path="/org/setup" element={<EventSetup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
