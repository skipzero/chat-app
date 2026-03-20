import { createContext } from "@chatapp/api/context";
import { appRouter } from "@chatapp/api/routers/index";

import { auth } from "@chatapp/auth";
import { env } from "@chatapp/env/server";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import type { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";

export function createApp() {
  const app = express();
  const httpServer = createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("rpc", async (payload: {
      path: string;
      data?: Record<string, unknown>;
      id?: string;
    }, callback?: (response: { result?: unknown; error?: unknown; id?: string }) => void) => {
      try {
        const context = await createContextFromSocket(socket);
        const result = await resolveAndCallRPC(payload.path, payload.data ?? {}, context);

        if (callback) {
          callback({ result, id: payload.id });
        }

        socket.emit("rpc:response", { result, id: payload.id });
      } catch (error) {
        console.error("RPC error:", error);
        if (callback) {
          callback({ 
            error: error instanceof Error ? error.message : "Unknown error", 
            id: payload.id 
          });
        }
        socket.emit("rpc:response", { 
          error: error instanceof Error ? error.message : "Unknown error", 
          id: payload.id 
        });
      }
    });

    socket.on("disconnect", (reason: string) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  app.use((_req, res, next) => {
    res.header('powered-by', 'Antiquated Technologies');
    next();
  });

  app.all("/api/auth{/*path}", toNodeHandler(auth));

  const rpcHandler = new RPCHandler(appRouter, {
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });
  const apiHandler = new OpenAPIHandler(appRouter, {
    plugins: [
      new OpenAPIReferencePlugin({
        schemaConverters: [new ZodToJsonSchemaConverter()],
      }),
    ],
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });

  app.use(async (req, res, next) => {
    const rpcResult = await rpcHandler.handle(req, res, {
      prefix: "/rpc",
      context: await createContext({ req }),
    });
    if (rpcResult.matched) return;

    const apiResult = await apiHandler.handle(req, res, {
      prefix: "/api-reference",
      context: await createContext({ req }),
    });
    if (apiResult.matched) return;

    next();
  });

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).send("OK");
  });

  httpServer.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
    console.log("Socket.IO is enabled");
  });
}

async function createContextFromSocket(socket: Socket) {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return { session: null };
  }

  try {
    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return { session };
  } catch {
    return { session: null };
  }
}

async function resolveAndCallRPC(path: string, data: Record<string, unknown>, context: Awaited<ReturnType<typeof createContextFromSocket>>) {
  const pathParts = path.split(".");
  let handler: unknown = appRouter;
  
  for (const part of pathParts) {
    if (handler && typeof handler === "object" && part in handler) {
      handler = (handler as Record<string, unknown>)[part];
    } else {
      throw new Error(`Path not found: ${path}`);
    }
  }

  if (!handler || typeof handler !== "object" || !("handler" in handler)) {
    throw new Error(`Handler not found for path: ${path}`);
  }

  const procedure = handler as { handler: (opts: { context: typeof context; input: unknown }) => Promise<unknown> };
  return procedure.handler({
    context,
    input: data,
  });
}
