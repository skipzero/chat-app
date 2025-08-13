// src/auth/refresh.js
import axios from 'axios';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function tryRefresh() {
  try {
    const res = await axios.post('http://localhost:4000/auth/refresh', {}, { withCredentials: true });
    setAccessToken(res.data.accessToken);
    return true;
  } catch {
    return false;
  }
}
