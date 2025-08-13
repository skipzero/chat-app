import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import { createSocket, getSocket } from './socket';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export default function App(){
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const navigate = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const sock = createSocket();
    sock.on('connect_error', (err) => console.error('socket err', err));
    // do not connect until logged in
    if (token) sock.connect();

    return ()=>{ try{ sock.close(); }catch(e){return e} };
  }, []);

  const handleLogin = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    const sock = getSocket() || createSocket();
    if (!sock.connected) sock.connect();
    navigate('/chat');
  }

  const handleLogout = ()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    const sock = getSocket(); if (sock) sock.disconnect();
    navigate('/login');
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register onRegister={handleLogin} />} />
      <Route path="/chat" element={<Chat user={user} onLogout={handleLogout} />} />
      <Route path="/" element={user ? <Chat user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />} />
    </Routes>
  )
}