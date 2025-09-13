import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getServerSession } from "next-auth/next";
import { getSession, signOut } from "next-auth/react";
import { authOptions } from "./auth";
import { showError } from "./notifications";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/**
 * ApiResponse<T>:
 * - For single fetch:   ApiResponse<{ item: Entity }>
 * - For list fetch:     ApiResponse<{ items: Entity[] }>
 * - For other calls: Use { item: Entity }
 */
export interface ApiResponse<T> {
  status: "success" | "error";
  code: number;
  message: string;
  data: T;
  errors: Array<{
    field: string;
    message: string;
  }>;
  meta: {
    pagination?: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
  };
}

interface ApiRequestConfig extends AxiosRequestConfig {
  showToast?: boolean;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;
  private sessionPromise: Promise<any> | null = null;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: false,
      withXSRFToken: false,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": API_KEY,
      },
    });

    this.axiosInstance.interceptors.request.use(async (config) => {
      const token = await this.getValidToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Only return data if status is "success"
        if (response.data && response.data.status === "success") {
          return response.data;
        } else {
          const message =
            response.data?.message || "API returned an error status";
          const errors = response.data?.errors;
          // Only show toast if showToast is not false
          const showToast =
            (response.config as ApiRequestConfig)?.showToast !== false;
          if (showToast) {
            if (Array.isArray(errors) && errors.length > 0) {
              const errorMessages = errors
                .map((err: any) =>
                  typeof err === "string"
                    ? err
                    : err && typeof err.message === "string"
                      ? err.message
                      : "",
                )
                .filter(Boolean)
                .join("\n");
              showError(errorMessages, "Error");
            } else {
              showError(message, "Error");
            }
          }
          const errorObj = new Error(message) as any;
          if (Array.isArray(errors)) {
            errorObj.errors = errors;
          }
          return Promise.reject(errorObj);
        }
      },
      (error) => {
        let message = "An error occurred";
        const config = (error.config || {}) as ApiRequestConfig;
        if (error.response) {
          message = error.response.data?.message || message;
        } else if (error.request) {
          message = "No response from server";
        } else if (error.message) {
          message = error.message;
        }
        if (message === "Unauthenticated.") {
          this.handleAuthError();
        }
        // Only show toast if showToast is not false
        const showToast = config.showToast !== false;
        if (showToast) {
          const errors = error.response?.data?.errors;
          if (Array.isArray(errors) && errors.length > 0) {
            const errorMessages = errors
              .map((err: any) =>
                typeof err === "string"
                  ? err
                  : err && typeof err.message === "string"
                    ? err.message
                    : "",
              )
              .filter(Boolean)
              .join("\n");
            showError(errorMessages, "Error");
          } else {
            showError(message, "Error");
          }
        }
        const errorObj = new Error(message) as any;
        const errors = error.response?.data?.errors;
        if (Array.isArray(errors)) {
          errorObj.errors = errors;
        }
        return Promise.reject(errorObj);
      },
    );
  }

  private async getValidToken(): Promise<string | null> {
    // If we have a cached token and it's not expired, use it
    if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    // If there's already a session request in progress, wait for it
    if (this.sessionPromise) {
      const session = await this.sessionPromise;
      return session?.accessToken || null;
    }

    // Determine if we're on server or client side and use appropriate NextAuth method
    let sessionPromise: Promise<any>;

    if (typeof window === "undefined") {
      // Server-side: use getServerSession
      sessionPromise = getServerSession(authOptions);
    } else {
      // Client-side: use getSession (NextAuth handles caching internally)
      sessionPromise = getSession();
    }

    this.sessionPromise = sessionPromise;

    try {
      const session = await this.sessionPromise;
      const token = session?.accessToken || null;

      if (token) {
        this.cachedToken = token;
        // Cache token for 23 hours (NextAuth session is 24 hours, leave 1 hour buffer)
        this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
      }

      return token;
    } finally {
      this.sessionPromise = null;
    }
  }

  /**
   * Force refresh the cached token on next request
   */
  public refreshToken(): void {
    this.cachedToken = null;
    this.tokenExpiry = null;
    this.sessionPromise = null;
  }

  private handleAuthError(): void {
    // Clear cached token on auth error
    this.refreshToken();
    signOut();
  }

  async get<T>(
    endpoint: string,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return await this.axiosInstance.get(endpoint, config);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return await this.axiosInstance.post(endpoint, data, config);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return await this.axiosInstance.put(endpoint, data, config);
  }

  async delete<T>(
    endpoint: string,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return await this.axiosInstance.delete(endpoint, config);
  }
}

export { ApiClient };
export const apiClient = new ApiClient(`${API_BASE_URL}/api/v1`);
