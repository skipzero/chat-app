"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type ChatMessage = {
  _id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
};

const WS_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export function useWebSocket(userId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const prevRoomRef = useRef<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!userId || socketRef.current) return;

    const socket = io(WS_URL, {
      auth: { userId },
      path: "/socket.io",
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("typing", ({ senderId }: { senderId: string }) => {
      setTypingUser(senderId);
      setTimeout(() => setTypingUser(null), 3000);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }, [userId]);

  const disconnect = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (!socketRef.current || !roomId) return;
    if (prevRoomRef.current && prevRoomRef.current !== roomId) {
      socketRef.current.emit("leave-room", prevRoomRef.current);
    }
    socketRef.current.emit("join-room", { roomId });
    prevRoomRef.current = roomId;
    setMessages([]);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit("leave-room", roomId);
    if (prevRoomRef.current === roomId) {
      prevRoomRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    (roomId: string, content: string) => {
      if (!userId || !socketRef.current || !roomId) return;
      socketRef.current.emit("send-message", { roomId, content });
    },
    [userId],
  );

  const sendTyping = useCallback(
    (roomId: string) => {
      if (!userId || !socketRef.current || !roomId) return;
      socketRef.current.emit("typing", { roomId });
    },
    [userId],
  );

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    messages,
    typingUser,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    setMessages,
  };
}
