import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Join AgriLens 🌱</p>
        {error && <div style={{ color: '#ef4444', marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handle}>
          <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <input placeholder="Location (e.g. Pollachi, Tamil Nadu)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Register</button>
        </form>
        <p style={{ marginTop: 16, color: '#9cb89a', textAlign: 'center', fontSize: 14 }}>
          Have an account? <Link to="/login" style={{ color: '#4caf50' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
