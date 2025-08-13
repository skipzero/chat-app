import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { getAccessToken } from '../auth/refresh';

export default function Rooms({ onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    const res = await api.get('/rooms', {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    });
    setRooms(res.data);
  }

  async function createRoom() {
    await api.post(
      '/rooms',
      { name: newRoom, isGroup: true },
      { headers: { Authorization: `Bearer ${getAccessToken()}` } }
    );
    setNewRoom('');
    fetchRooms();
  }

  return (
    <div>
      <h2>Your Rooms</h2>
      <ul>
        {rooms.map(r => (
          <li key={r._id}>
            {r.name} <button onClick={() => onSelectRoom(r)}>Join</button>
          </li>
        ))}
      </ul>
      <input value={newRoom} onChange={e => setNewRoom(e.target.value)} placeholder="Room name" />
      <button onClick={createRoom}>Create</button>
    </div>
  );
}
