"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
};      

type WebSocketMessage =
  | { type: "connected"; userId: string }
  | { type: "message"; message: Message }
  | { type: "typing"; senderId: string };

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/ws";

export function useWebSocket(userId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!userId) return;

    const readyState = wsRef.current?.readyState;
    if (readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (wsRef.current !== ws) return;
      ws.send(JSON.stringify({ type: "auth", userId }));
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      if (wsRef.current !== ws) return;
      const data = JSON.parse(event.data) as WebSocketMessage;
      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "typing") {
        setTypingUser(data.senderId);
        setTimeout(() => setTypingUser(null), 3000);
      }
    };

    ws.onclose = () => {
      if (wsRef.current !== ws) return;
      wsRef.current = null;
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      if (wsRef.current !== ws) return;
      console.error(`WebSocket error: ${err} User ID: ${userId}`);
      console.log(err);
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [userId]);

  const disconnect = useCallback(() => {
    if (!wsRef.current) return;
    wsRef.current.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback(
    (receiverId: string, content: string) => {
      if (!userId || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(
        JSON.stringify({ type: "message", senderId: userId, receiverId, content })
      );
    },
    [userId]
  );

  const sendTyping = useCallback(
    (receiverId: string) => {
      if (!userId || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(JSON.stringify({ type: "typing", senderId: userId, receiverId }));
    },
    [userId]
  );

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, messages, typingUser, sendMessage, sendTyping, setMessages };
}
