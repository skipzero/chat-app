"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { orpc } from "@/utils/orpc";

export default function RoomsPage() {
  const [newRoomsText, setNewRoomsText] = useState("");

  const rooms = useQuery(orpc.rooms.getAll.queryOptions());
  const createMutation = useMutation(
    orpc.rooms.create.mutationOptions({
      onSuccess: () => {
        rooms.refetch();
        setNewRoomsText("");
      },
    }),
  );
  const toggleMutation = useMutation(
    orpc.rooms.toggle.mutationOptions({
      onSuccess: () => {
        rooms.refetch();
      },
    }),
  );
  const deleteMutation = useMutation(
    orpc.rooms.delete.mutationOptions({
      onSuccess: () => {
        rooms.refetch();
      },
    }),
  );

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomsText.trim()) {
      createMutation.mutate({ text: newRoomsText });
    }
  };

  const handleToggleRoom = (id: number, completed: boolean) => {
    toggleMutation.mutate({ id, completed: !completed });
  };

  const handleDeleteRoom = (id: number) => {
    deleteMutation.mutate({ id });
  };

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Rooms List</CardTitle>
          <CardDescription>Manage your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddRoom} className="mb-6 flex items-center space-x-2">
            <Input
              value={newRoomsText}
              onChange={(e) => setNewRoomsText(e.target.value)}
              placeholder="Add a new room..."
              disabled={createMutation.isPending}
            />
            <Button type="submit" disabled={createMutation.isPending || !newRoomsText.trim()}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </form>

          {rooms.isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : rooms.data?.length === 0 ? (
            <p className="py-4 text-center">No rooms yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {rooms.data?.map((room) => (
                <li
                  key={room.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={room.completed}
                      onCheckedChange={() => handleToggleRooms(room.id, room.completed)}
                      id={`rooms-${room.id}`}
                    />
                    <label
                      htmlFor={`room-${room.id}`}
                      className={`${room.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {room.text}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRooms(room.id)}
                    aria-label="Delete room"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
