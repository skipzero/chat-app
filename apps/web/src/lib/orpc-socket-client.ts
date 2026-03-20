"use client";

import { io, Socket } from "socket.io-client";
import { useCallback, useEffect, useRef, useState } from "react";

interface ORPCResponse<T = unknown> {
  result?: T;
  error?: string;
  id?: string;
}

interface UseORPCSocketOptions {
  url?: string;
  token?: string;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
}

export function useORPCSocket(options: UseORPCSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pendingCallbacks = useRef<Map<string, { resolve: (value: unknown) => void; reject: (error: Error) => void }>>(new Map());

  useEffect(() => {
    const url = options.url ?? (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    
    socketRef.current = io(url, {
      auth: { token: options.token },
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      options.onConnect?.();
    });

    socketRef.current.on("disconnect", (reason) => {
      setIsConnected(false);
      options.onDisconnect?.(reason);
    });

    socketRef.current.on("rpc:response", (response: ORPCResponse) => {
      if (response.id) {
        const callbacks = pendingCallbacks.current.get(response.id);
        if (callbacks) {
          if (response.error) {
            callbacks.reject(new Error(response.error));
          } else {
            callbacks.resolve(response.result);
          }
          pendingCallbacks.current.delete(response.id);
        }
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [options.url, options.token, options.onConnect, options.onDisconnect]);

  const call = useCallback(async <T = unknown>(path: string, data?: Record<string, unknown>): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const id = crypto.randomUUID();
      pendingCallbacks.current.set(id, { resolve: resolve as (value: unknown) => void, reject });

      socketRef.current?.emit("rpc", { path, data, id }, (response: ORPCResponse) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result as T);
        }
        pendingCallbacks.current.delete(id);
      });

      setTimeout(() => {
        if (pendingCallbacks.current.has(id)) {
          pendingCallbacks.current.delete(id);
          reject(new Error("Request timeout"));
        }
      }, 30000);
    });
  }, []);

  return { call, isConnected, socket: socketRef.current };
}
