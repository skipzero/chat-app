"use client";

import { env } from "@chatapp/env/web";
import { Send } from "lucide-react";
// Temporary local Message type definition
type Message = {
  id?: string;
  text: string;
  role?: string;
  parts?: { type: "text"; text: string }[];
};

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { set } from "zod";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([])

  const sendMessage = (newMessage: Message) => {
    setMessages(() => [
      newMessage, ...messages,
    ]);
    }
  
  // TODO: remove and reploace with API call
  // const { messages, sendMessage, status } = useChat({
  //   transport: new DefaultChatTransport({
  //     api: `${env.NEXT_PUBLIC_SERVER_URL}/ai`,
  //   }),
  // });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="grid grid-rows-[1fr_auto] overflow-hidden w-3xl mx-auto p-4">
      <div className="overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            -- No Messages Yet. Start the conversation! --
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === "user" ? "bg-primary/10 ml-8" : "bg-secondary/20 mr-8"
              }`}
            >
              <p className="text-sm font-semibold mb-1">
                {message.role === "user" ? "You" : "AI Assistant"}
              </p>
              {message.parts?.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <span key={index}>{part.text}</span>
                  );
                }
                return null;
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="w-full flex items-center space-x-2 pt-2 border-t">
        <Input
          name="prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          autoComplete="off"
          autoFocus
        />
        <Button type="submit" size="icon">
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
