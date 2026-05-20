"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type ChatMessage = {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
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
      console.log("Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket server");
    });

    socket.on("message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      console.log("Received message:", message);
    });

    socket.on("typing", ({ senderId }: { senderId: string }) => {
      setTypingUser(senderId);
      setTimeout(() => setTypingUser(null), 3000);
      console.log("User is typing:", senderId);
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
    (roomId: string, senderName: string, content: string) => {
      if (!userId || !socketRef.current || !roomId) return;
      socketRef.current.emit("send-message", { roomId, senderName, content });
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
