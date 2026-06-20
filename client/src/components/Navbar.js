import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: '📷 Scan' },
  { to: '/history', label: '📋 History' },
  { to: '/fields', label: '🌱 Fields' },
  { to: '/analytics', label: '📊 Analytics' },
];

const style = {
  sidebar: { position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: '#16241a', borderRight: '1px solid #2a3d2a', display: 'flex', flexDirection: 'column', padding: '24px 0', zIndex: 100 },
  logo: { fontSize: 20, fontWeight: 800, color: '#4caf50', padding: '0 20px 24px', borderBottom: '1px solid #2a3d2a' },
  nav: { flex: 1, padding: '16px 0' },
  link: { display: 'block', padding: '10px 20px', color: '#9cb89a', textDecoration: 'none', borderRadius: 8, margin: '2px 8px', fontSize: 14, fontWeight: 500 },
  active: { background: '#1b3a1b', color: '#a5d6a7' },
  logout: { margin: '0 8px', padding: '10px 20px', background: 'none', border: '1px solid #2a3d2a', borderRadius: 8, color: '#9cb89a', cursor: 'pointer', fontSize: 14, width: 'calc(100% - 16px)' },
};

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <aside style={style.sidebar}>
      <div style={style.logo}>🌾 AgriLens</div>
      <nav style={style.nav}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}
            style={({ isActive }) => ({ ...style.link, ...(isActive ? style.active : {}) })}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '0 8px 16px' }}>
        <div style={{ padding: '12px', background: '#0f1a0f', borderRadius: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 11, color: '#9cb89a' }}>{user.location || 'No location set'}</div>
        </div>
        <button style={style.logout} onClick={logout}>🚪 Logout</button>
      </div>
    </aside>
  );
}
