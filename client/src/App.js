import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Scan from './pages/Scan';
import History from './pages/History';
import Fields from './pages/Fields';
import Analytics from './pages/Analytics';
import './App.css';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <PrivateRoute>
            <Navbar />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Scan />} />
                <Route path="/history" element={<History />} />
                <Route path="/fields" element={<Fields />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
