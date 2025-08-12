import { io as ioClient } from "socket.io-client";
const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

let socket = null;
export function createSocket() {
  const token = localStorage.getItem("token");
  socket = ioClient(SERVER, {
    auth: { token: token ? `Bearer ${token}` : "" },
    autoConnect: false,
  });
  return socket;
}
export function getSocket() {
  return socket;
}
