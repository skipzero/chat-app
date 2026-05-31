import { env as webEnv} from "@chatapp/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const { NEXT_PUBLIC_SERVER_URL } = webEnv;

export const env = createEnv({
  client: {
    NEXT_PUBLIC_SERVER_URL: z.url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SERVER_URL: NEXT_PUBLIC_SERVER_URL,
  },
  emptyStringAsUndefined: true,
});
