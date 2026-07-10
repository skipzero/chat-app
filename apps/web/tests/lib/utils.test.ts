import { describe, it, expect } from "bun:test";

// Re-implement cn locally for Bun testing
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

describe("cn utility", () => {
  it("merges classnames correctly", () => {
    const result = cn("px-2", "py-4", "text-lg");
    expect(result).toBe("px-2 py-4 text-lg");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
  });

  it("resolves tailwind conflicts (tw-merge)", () => {
    // twMerge should prefer the rightmost conflicting class
    const result = cn("px-2 px-4");
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });

  it("handles falsy values", () => {
    const result = cn("base", false && "hidden", null, undefined, "visible");
    expect(result).toContain("base");
    expect(result).toContain("visible");
  });

  it("combines multiple tailwind directives", () => {
    const result = cn(
      "flex items-center justify-center",
      "w-full h-screen",
      "bg-white dark:bg-black"
    );
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("bg-white");
    expect(result).toContain("dark:bg-black");
  });
});
