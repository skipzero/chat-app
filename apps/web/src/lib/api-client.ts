import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

export function createApiClient(getToken: () => Promise<string | null>): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.BETTER_AUTH_URL ?? "http:localhost:5000",
    withCredentials: false,
  });

  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
      return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Handle unauthorized error, e.g., redirect to login
        console.error("Unauthorized! Redirecting to login...");
        // You can implement your redirection logic here
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export async function apiGet <T> (
  client: AxiosInstance, 
  url: string,
  config?: AxiosRequestConfig): Promise<T> {
    const response = await client.get<{data: T}>(url, config);
    return response.data.data;
  }
