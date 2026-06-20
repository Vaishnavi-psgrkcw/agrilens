import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🌾 AgriLens</h1>
        <p>Crop disease detection for smallholder farmers</p>
        {error && <div style={{ color: '#ef4444', marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <form onSubmit={handle}>
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Login</button>
        </form>
        <p style={{ marginTop: 16, color: '#9cb89a', textAlign: 'center', fontSize: 14 }}>
          No account? <Link to="/register" style={{ color: '#4caf50' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
