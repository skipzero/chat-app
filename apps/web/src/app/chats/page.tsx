"use client";

import "./chat.css";

import { useEffect, useRef, useState, type ChangeEvent, type SubmitEvent } from "react";
import { Send } from "lucide-react";

import { useWebSocket } from "../../lib/useWebSocket";
import { getRoomMessages, getRooms, createRoom, type Room } from "../../lib/api";
import { useSession } from "@/lib/auth-client";
import { Input, Button } from "@/components/ui";
import { Textarea } from "@chatapp/ui/components/textarea"


interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export default function ChatPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user.id || null;
  const senderName = session?.user.name || "Unknown";
  const { messages, setMessages, typingUser, isConnected, joinRoom, sendMessage } = useWebSocket(userId);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [input, setInput] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    getRooms()
      .then((fetchedRooms) => {
        setRooms(fetchedRooms);
        if (!activeRoomId && fetchedRooms.length > 0) {
          setActiveRoomId(fetchedRooms[0]._id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load rooms."))
      .finally(() => setIsLoading(false));
  }, [userId, activeRoomId]);

  useEffect(() => {
    if (!activeRoomId) return;

    setIsLoading(true);
    getRoomMessages(activeRoomId)
      .then((roomMessages) => setMessages(roomMessages))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load messages."))
      .finally(() => setIsLoading(false));

    joinRoom(activeRoomId);
  }, [activeRoomId, joinRoom, setMessages]);

  useEffect(() => {
    setActiveRoom(rooms.find((room) => room._id === activeRoomId) ?? null);
  }, [activeRoomId, rooms]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRoomSelect = (roomId: string) => {
    setActiveRoomId(roomId);
  };

  const handleCreateRoom = async (event:SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const room = await createRoom(newRoomName.trim(), newRoomDescription.trim());
      setRooms((current) => [room, ...current]);
      setActiveRoomId(room._id);
      setNewRoomName("");
      setNewRoomDescription("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room.");
    }
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeRoomId || !input.trim()) return;
    sendMessage(activeRoomId, senderName, input.trim());
    setInput("");
  };

  if (isPending) {
    return <div className="p-6">Loading session...</div>;
  }

  if (!userId) {
    return (
      <div className="p-6 text-center">
        <div className="text-lg font-semibold">Sign in to join chat rooms.</div>
        <p className="mt-2 text-sm text-muted-foreground">Use the login page to authenticate before chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 justify-center gap-4 p-4 max-w-8xl mx-auto h-[calc(100svh-4rem)]">
      {isSidebarOpen ? (
        <aside className="flex-shrink-0 w-[240px] flex flex-col gap-4 rounded-lg border border-border p-4 bg-panel">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Rooms</h2>
                <p className="text-sm text-muted-foreground">Join a room to chat live.</p>
              </div>
              <span className={`text-xs font-medium ${isConnected ? "text-emerald-600" : "text-rose-600"}`}>
                {isConnected ? "Connected" : "Offline"}
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto">
              {isLoading && <div className="text-sm text-muted-foreground">Loading rooms…</div>}
              {!isLoading && rooms.length === 0 && <div className="text-sm text-muted-foreground">No rooms yet. Create one.</div>}
              {rooms.map((room) => (
                <button
                  key={room._id}
                  type="button"
                  onClick={() => handleRoomSelect(room._id)}
                  className={`block w-full text-left rounded-md border px-3 py-2 ${room._id === activeRoomId ? "border-primary bg-primary/10" : "border-border bg-background"}`}
                >
                  <div className="font-semibold">{room.name}</div>
                  <div className="text-sm text-muted-foreground">{room.description ?? "No description"}</div>
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3 pt-4 border-t border-muted/20">
              <div>
                <label htmlFor="room-name" className="block text-sm font-medium mb-1">
                  New room
                </label>
                <Input
                  id="room-name"
                  value={newRoomName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setNewRoomName(event.target.value)}
                  placeholder="Room name"
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  id="room-description"
                  value={newRoomDescription}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setNewRoomDescription(event.target.value)}
                  placeholder="Description (optional)"
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full">
                Create room
              </Button>
            </form>
          </div>
        </aside>
      ) : null}

      <section className="basis-[80%] max-w-[80%] min-w-0 flex flex-col rounded-lg border border-border bg-panel p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{activeRoom?.name ?? "Select a room"}</h2>
            <p className="text-sm text-muted-foreground">{activeRoom?.description ?? "Pick a room from the list to see messages."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-muted-foreground">{messages.length} messages</div>
            <Button type="button" variant="secondary" className="h-9 text-sm" onClick={() => setIsSidebarOpen((open) => !open)}>
              {isSidebarOpen ? "Hide rooms" : "Show rooms"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 rounded-lg border border-background p-3">
          {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">No messages yet in this room.</div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`rounded-2xl px-4 py-3 w-3/5 text-gray-400 ${message.senderId === userId ? "bg-primary/10 ml-auto text-right " : "bg-secondary/10 mr-auto text-left others"}`}
              >
                <div className="text-xs text-muted-foreground mb-1">{message.senderId === userId ? senderName : message.senderName}</div>
                <div>{message.content}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString()}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-2 min-h-[1.5rem] text-sm text-muted-foreground">{typingUser ? `${typingUser} is typing...` : ""}</div>

        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <Textarea
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
            placeholder={activeRoom ? "Type a message..." : "Select a room first"}
            className="flex-1"
            disabled={!activeRoom}
            autoComplete="off"
          />
          <Button type="submit" disabled={!activeRoom || input.trim().length === 0}>
            <Send size={18} />
          </Button>
        </form>
      </section>
    </div>
  );
}
