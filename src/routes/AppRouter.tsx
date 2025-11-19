import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import DashboardCoord from '../pages/DashboardCoord'
import DashboardAdmin from '../pages/DashboardAdmin'
import PublicCalendar from '../pages/PublicCalendar'
import { useSession } from '../services/useSession'

export default function AppRouter() {
  const { user, loading } = useSession()
  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/coord" /> : <Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/coord" element={user ? <DashboardCoord user={user} /> : <Navigate to="/" />} />
        <Route path="/admin" element={user ? <DashboardAdmin /> : <Navigate to="/" />} />
        <Route path="/public/:slug" element={<PublicCalendar />} />
        <Route path="*" element={<div className="p-6">Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  )
}
