# Backend Unit Tests

This project uses **Bun's native test runner** and **Jest** for comprehensive test coverage of the Express backend.

## Test Frameworks

| Framework | Runner | Config | Test Files |
| ----------- | -------- | -------- | ----------- |
| **Bun** | `bun test` | Built-in | `tests/**/*.test.ts` |
| **Jest** | `jest` | `jest.config.cjs` | `tests/**/*.jest.test.ts` |

## Running Tests

### All tests (Bun native)

```bash
bun test tests/
```

### Specific test file (Bun)

```bash
bun test tests/room-service.test.ts
```

### Jest tests only

```bash
bun run test:jest
```

### Watch mode (Bun)

```bash
bun test --watch tests/
```

## Test Files

- **`tests/room-service.test.ts`** — Bun tests for room slug generation and validation
- **`tests/room-service.jest.test.ts`** — Jest version of the same tests
- **`tests/api-routes.test.ts`** — Example API route validation tests

## Mocking Database and Socket.io

Bun's built-in `mock()` function is used to mock external dependencies:

```typescript
import { mock } from "bun:test";

// Mock Mongoose model
const mockRoomModel = {
  find: mock(() => ({
    sort: mock(() => ({
      lean: mock(() => Promise.resolve([/* data */]))
    }))
  })),
  create: mock((data) => Promise.resolve({ _id: "new-id", ...data }))
};

// Mock Socket.io
const mockSocket = {
  emit: mock(),
  join: mock(),
  to: mock(() => ({ emit: mock() }))
};
```

### Test Patterns

#### Mock Chain Calls#### (for `Model.find().sort().lean()`)

```typescript
const rooms = await mockRoomModel.find().sort({ createdAt: -1 }).lean();
```

#### Track Mock Calls

```typescript
mockSocket.emit("message", data);
expect(mockSocket.emit).toHaveBeenCalledWith("message", data);
```

#### Clear Mocks Between Tests

```typescript
beforeEach(() => {
  mockRoomModel.find.mockClear();
});
```

### Testing Database Queries

See [tests/api-routes.test.ts](tests/api-routes.test.ts) for examples of mocking:

- Mongoose `find()`, `findOne()`, `create()`, `insertMany()`
- Query chain methods (`.sort()`, `.lean()`)
- Duplicate detection

### Testing Socket.io Events

Mock patterns for Socket.io event handlers:

- `socket.emit()` — send events to client
- `socket.join()` — subscribe to room
- `socket.to(roomId).emit()` — broadcast to room
- `socket.on()` — listen for client events

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

## Key Test Utilities

- **`createSlug(name)`** — Converts a room name to a URL-safe slug
- **`validateRoomInput(input)`** — Validates room creation payload
- Test helpers include payload validation and error response checking

## Next Steps

1. **Mock external dependencies** (MongoDB, Socket.io) using Bun's built-in or Jest mocking utilities
2. **Add integration tests** for Express route handlers using `supertest`
3. **Test Socket.io events** with mock sockets
4. **Add database tests** using a test MongoDB instance (or in-memory mock)

## Debugging Tests

### Run with verbose output

```bash
bun test --verbose tests/
```

### Run a single test

```bash
bun test tests/room-service.test.ts --grep "creates a slug"
```

### Jest debug

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```
