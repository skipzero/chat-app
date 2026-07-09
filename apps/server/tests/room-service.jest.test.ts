import { describe, it, expect } from "bun:test";
import { createSlug, validateRoomInput } from "../src/lib/room-service";

describe("room service (jest)", () => {
  it("creates a slug from a room name", () => {
    expect(createSlug("General Chat")).toBe("general-chat");
  });

  it("strips unsupported characters from the slug", () => {
    expect(createSlug("Room #1!")).toBe("room-1");
  });

  it("rejects an empty room name", () => {
    expect(validateRoomInput({ name: "   " })).toEqual({ ok: false, error: "Room name is required" });
  });

  it("accepts a valid room name and returns a slug", () => {
    expect(validateRoomInput({ name: "Design Review", description: "Weekly sync" })).toEqual({ ok: true, slug: "design-review" });
  });
});
