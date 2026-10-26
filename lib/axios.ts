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
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to communicate with the server.";
    return Promise.reject(new Error(message));
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
  status: boolean;
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
