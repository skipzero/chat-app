# Web App Testing

This project uses **Bun's native test runner** and **Jest** with **React Testing Library** for comprehensive frontend testing.

## Test Frameworks

| Framework | Runner | Config | Test Files | Use Case |
| ----------- | -------- | -------- | ----------- | ---------- |
| **Bun** | `bun test` | Built-in | `tests/**/*.test.ts` | Utilities, pure functions |
| **Jest** | `jest` | `jest.config.cjs` | `tests/**/*.jest.test.ts(x)` | Components, React hooks |
| **React Testing Library** | Jest | Built-in | Component tests | User-centric component testing |

## Running Tests

### All tests (Bun native)

```bash
bun test tests/
```

### Specific test file (Bun)

```bash
bun test tests/lib/utils.test.ts
```

### Jest tests only

```bash
bun run test:jest
```

### Watch mode (Bun)

```bash
bun test --watch tests/
```

### Watch mode (Jest)

```bash
jest --watch --config jest.config.cjs
```

## Test Files

### Utilities & Pure Functions

- **`tests/lib/utils.test.ts`** — Bun tests for the `cn()` className utility
- **`tests/lib/api.test.ts`** — Bun tests for API functions with mocked fetch

### Components (Jest + React Testing Library)

- **`tests/components/component-basics.jest.test.tsx`** — Basic component rendering and interaction tests
- **`tests/lib/api.jest.test.ts`** — Jest version of API tests

## Writing Tests

### Bun (native)

```typescript
import { describe, it, expect } from "bun:test";

describe("my feature", () => {
  it("does something", () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Jest

```typescript
describe("my feature", () => {
  it("does something", () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### React Component (Jest + RTL)

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '../src/components/MyComponent';

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });
});
```

## Testing Patterns

### Mocking Fetch (Bun)

```typescript
import { mock } from "bun:test";

const mockFetch = mock((_url?: string) => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({ data: "test" })
} as Response));

global.fetch = mockFetch;
```

### Mocking Fetch (Jest)

```typescript
global.fetch = jest.fn().mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: "test" })
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it("handles user interaction", async () => {
  render(<MyComponent />);
  const button = screen.getByRole("button");
  
  await userEvent.click(button);
  
  expect(screen.getByText("Updated")).toBeInTheDocument();
});
```

### Testing API Functions

```typescript
it("fetches data correctly", async () => {
  mockFetch.mockReturnValueOnce(Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData)
  } as Response));

  const result = await fetchData();
  expect(result).toEqual(mockData);
});
```

## Key Test Utilities

### API Functions

- `getRooms()` — Fetch all chat rooms
- `getRoomMessages(roomId)` — Fetch messages in a room
- `createRoom(name, description?)` — Create a new room

### Component Utilities

- `cn()` — Merge Tailwind classes with conflict resolution
- Responsive design patterns

## Next Steps

1. **Add component tests** for sign-in/sign-up forms
2. **Test WebSocket integration** with Socket.io client
3. **Test custom hooks** like `useWebSocket()`
4. **Add visual regression tests** with tools like Percy or Chromatic
5. **Integration tests** for full user flows

## Debugging Tests

### Run with verbose output

```bash
bun test --verbose tests/
```

### Run a single test

```bash
bun test tests/lib/utils.test.ts --grep "merges classnames"
```

### Jest debug

```bash
node --inspect-brk node_modules/.bin/jest --runInBand --config jest.config.cjs
```

### Check TypeScript types

```bash
bun run check-types
```
