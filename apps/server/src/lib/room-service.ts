export type RoomInput = {
  name: string;
  description?: string;
};

export function createSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
}

export function validateRoomInput(input: RoomInput) {
  if (!input.name || input.name.trim() === "") {
    return { ok: false, error: "Room name is required" };
  }

  return { ok: true, slug: createSlug(input.name) };
}
