import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import api from './api';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { FollowUps } from './pages/FollowUps';
import { Team } from './pages/Team';
import { Clients } from './pages/Clients';
import { Reports } from './pages/Reports';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  async function refresh() {
    try { const { data } = await api.get('/auth/me'); setUser(data.user); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const logout = () => { setUser(null); nav('/login'); };
    window.addEventListener('leadflow:logout', logout);
    return () => window.removeEventListener('leadflow:logout', logout);
  }, [nav]);
  if (loading) return <div className="loading">Loading LeadFlow…</div>;
  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={refresh} />} />
    <Route path="/*" element={user ? <Layout user={user} onLogout={async()=>{await api.post('/auth/logout');setUser(null);nav('/login');}}>
      <Routes>
        <Route path="/" element={<Dashboard user={user}/>} />
        <Route path="/leads" element={<Leads user={user}/>} />
        <Route path="/follow-ups" element={<FollowUps user={user}/>} />
        <Route path="/team" element={user.role === 'admin' ? <Team/> : <Navigate to="/"/>} />
        <Route path="/clients" element={<Clients user={user}/>} />
        <Route path="/reports" element={<Reports/>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout> : <Navigate to="/login" />} />
  </Routes>;
}
