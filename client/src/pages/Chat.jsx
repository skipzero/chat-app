import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getSocket } from "../socket";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

export default function Chat({ user, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const inputRef = useRef();

  useEffect(() => {
    if (!user) return;
    fetchRooms();
  }, [user]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("new_message", (message) => {
      if (message.roomId === activeRoom)
        setMessages((prev) => [...prev, message]);
    });
    socket.on("room_participants", (person) => setParticipants(person));
    socket.on("typing", ({ userId: uid, userName: uname }) => {
      setTypingUsers((prev) => ({ ...prev, [uid]: uname }));
      setTimeout(
        () =>
          setTypingUsers((prev) => {
            const c = { ...prev };
            delete c[uid];
            return c;
          }),
        5000
      );
    });
    socket.on("stop_typing", ({ userId: uid }) =>
      setTypingUsers((prev) => {
        const c = { ...prev };
        delete c[uid];
        return c;
      })
    );
    return () => {
      socket.off("new_message");
      socket.off("room_participants");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [activeRoom]);

  async function fetchRooms() {
    try {
      const res = await axios.get(`${SERVER}/rooms`);
      setRooms(res.data || []);
    } catch (err) {
      console.error("fetch rooms", err);
    }
  }

  async function createRoom(title) {
    try {
      const res = await axios.post(`${SERVER}/rooms`, { title });
      setRooms((prev) => [res.data, ...prev]);
      setActiveRoom(res.data._id);
    } catch (err) {
      console.error("create room", err);
    }
  }

  useEffect(() => {
    if (!activeRoom) return;
    const socket = getSocket();
    socket.emit("join_room", { roomId: activeRoom });
    (async () => {
      try {
        const res = await axios.get(
          `${SERVER}/rooms/${activeRoom}/messages?limit=100`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setMessages(res.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      const sock = getSocket();
      if (sock) sock.emit("leave_room", { roomId: activeRoom });
      setMessages([]);
      setParticipants([]);
    };
  }, [activeRoom]);

  let typingTimer = useRef(null);
  const sendTyping = () => {
    const sock = getSocket();
    if (!sock) return;
    sock.emit("typing", { roomId: activeRoom });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      const sock = getSocket();
      if (sock) sock.emit("stop_typing", { roomId: activeRoom });
    }, 1500);
  };

  const sendMessage = (text) => {
    const sock = getSocket();
    if (!sock) return;
    if (!text) return;
    sock.emit("send_message", { roomId: activeRoom, text });
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-80 p-3 border-b md:border-r bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold">Chat</div>
            <div className="text-xs text-gray-500">
              Signed in as {user?.username}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-indigo-600 text-white"
              onClick={() => createRoom("New Group")}
            >
              New Room
            </button>
            <button className="px-3 py-1 rounded border" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="mb-2 text-sm font-semibold">Rooms</div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {rooms.map((room) => (
            <div
              key={room._id}
              className={`p-2 rounded cursor-pointer ${
                activeRoom === room._id ? "bg-indigo-50" : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveRoom(room._id)}
            >
              <div className="font-medium">{room.title}</div>z
              <div className="text-xs text-gray-400">
                {room.isDM ? "Direct Message" : room._id}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="p-3 border-b bg-white flex items-center justify-between">
          <div>
            <div className="font-semibold">
              {rooms.find((room) => room._id === activeRoom)?.title ||
                (activeRoom ? activeRoom : "Select a room")}
            </div>
            <div className="text-xs text-gray-500">
              Participants: {participants.length}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Mobile-friendly • Real-time
          </div>
        </header>

        <section className="flex-1 overflow-auto p-4" id="message-list">
          <div className="space-y-3 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message._id || Math.random()}
                className={`p-2 rounded ${
                  String(message.senderId) === String(user?.id)
                    ? "bg-indigo-100 self-end"
                    : "bg-white"
                }`}
              >
                <div className="text-xs text-gray-500">
                  {message.senderName} •{" "}
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
                <div className="mt-1">{message.text}</div>
              </div>
            ))}

            {Object.keys(typingUsers).length > 0 && (
              <div className="text-sm text-gray-400">
                {Object.values(typingUsers).join(", ")} typing…
              </div>
            )}
          </div>
        </section>

        <footer className="p-3 border-t bg-white">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              ref={inputRef}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type a message"
              onChange={sendTyping}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <button
              className="px-4 py-2 rounded bg-indigo-600 text-white"
              onClick={() => {
                const v = inputRef.current.value;
                sendMessage(v);
                inputRef.current.value = "";
              }}
            >
              Send
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
