import axios, { AxiosError } from "axios";


export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Extract human-readable error messages from responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; data?: unknown }>) => {
    const errorData = error.response?.data;
    let message = errorData?.message;

    // If backend zodValidator returns formatted field errors in data
    if (errorData?.data && typeof errorData.data === "object") {
      const fieldMessages: string[] = [];
      const extractErrors = (obj: unknown) => {
        if (!obj || typeof obj !== "object") return;
        const record = obj as Record<string, unknown>;
        if (Array.isArray(record._errors) && record._errors.length > 0) {
          for (const err of record._errors) {
            if (typeof err === "string") fieldMessages.push(err);
          }
        }
        for (const key of Object.keys(record)) {
          if (key !== "_errors") {
            extractErrors(record[key]);
          }
        }
      };
      extractErrors(errorData.data);
      if (fieldMessages.length > 0) {
        message = fieldMessages.join("; ");
      }
    }

    return Promise.reject(
      new Error(message || error.message || "Unable to communicate with the server.")
    );
  }
);

// Types

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  status?: boolean;
  success?: boolean;
  message: string;
  data: T;
}


// Auth API Calls

export const authApi = {

  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>("/auth/login", credentials);
    return res.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const res = await api.post<ApiResponse<null>>("/auth/logout");
    return res.data;
  },


  async getProfile(): Promise<ApiResponse<User>> {
    const res = await api.get<ApiResponse<User>>("/auth/profile");
    return res.data;
  },
};

export default api;
