import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export default function Register({ onRegister }){
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try{
      const res = await axios.post(`${SERVER}/auth/register`, { username, email, password });
      onRegister(res.data);
    }catch(err){ setErr(err.response?.data?.error || 'Registration failed'); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="p-6 bg-white rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        {err && <div className="text-red-500 mb-2">{err}</div>}
        <input className="w-full mb-2 border rounded px-3 py-2" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full mb-2 border rounded px-3 py-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full mb-4 border rounded px-3 py-2" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full py-2 rounded bg-indigo-600 text-white">Create account</button>
        <div className="mt-4 text-sm">Have an account? <Link to="/login" className="text-indigo-600">Login</Link></div>
      </form>
    </div>
  )
}