import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Farmers from '../pages/Farmers';
import Produce from '../pages/Produce';
import Collections from '../pages/Collections';
import Statements from '../pages/Statements';
import Assistant from '../pages/Assistant';
import Testing from '../pages/Testing';
import About from '../pages/About';
import { ROUTES } from '../constants';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Protected operator dashboard routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path={ROUTES.FARMERS} element={<Farmers />} />
        <Route path={ROUTES.PRODUCE} element={<Produce />} />
        <Route path={ROUTES.COLLECTIONS} element={<Collections />} />
        <Route path={ROUTES.STATEMENTS} element={<Statements />} />
        <Route path={ROUTES.ASSISTANT} element={<Assistant />} />
        <Route path={ROUTES.TESTING} element={<Testing />} />
        <Route path={ROUTES.ABOUT} element={<About />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
