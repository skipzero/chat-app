declare namespace NodeJS {
    interface ProcessEnv {
      DATABASE_NAME: string;
      DATABASE_URL: string;
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
      PORT?: string;
    }
  }
