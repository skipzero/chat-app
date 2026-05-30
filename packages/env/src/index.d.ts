declare namespace NodeJS {
    interface ProcessEnv {
      DATABASE_NAME: string;
      DATABASE_URL: string;
      CORS_ORIGIN: string;
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
      PORT?: string;
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_SERVER_URL: string;
    }
  }
