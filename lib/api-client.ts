import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getServerSession } from "next-auth/next";
import { getSession, signOut } from "next-auth/react";
import { authOptions } from "./auth";
import { showError } from "./notifications";

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const TOKEN_CACHE_DURATION = 23 * 60 * 60 * 1000; // 23 hours

// Types
export interface ApiResponse<T> {
  status: "success" | "error";
  code: number;
  message: string;
  data: T;
  errors: Array<{ field: string; message: string }>;
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

export interface ApiRequestConfig extends AxiosRequestConfig {
  showToast?: boolean;
}

// Error handling utilities
const createError = (message: string, errors?: any[]): Error => {
  const error = new Error(message) as any;
  if (Array.isArray(errors)) {
    error.errors = errors;
  }
  return error;
};

const formatErrorMessages = (errors: any[]): string => {
  return errors
    .map(err => typeof err === "string" ? err : err?.message || "")
    .filter(Boolean)
    .join("\n");
};

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;
  private sessionPromise: Promise<any> | null = null;

  constructor(baseURL: string) {
    this.axiosInstance = this.createAxiosInstance(baseURL);
    this.setupInterceptors();
  }

  private createAxiosInstance(baseURL: string): AxiosInstance {
    return axios.create({
      baseURL,
      // withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": API_KEY,
      },
    });
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      this.handleRequest.bind(this)
    );
    
    this.axiosInstance.interceptors.response.use(
      this.handleSuccessResponse.bind(this),
      this.handleErrorResponse.bind(this)
    );
  }

  private async handleRequest(config: any): Promise<any> {
    const token = await this.getValidToken();
    
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Handle FormData - remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    return config;
  }

  private handleSuccessResponse(response: any): any {
    if (response.data?.status === "success") {
      return response.data;
    }
    
    return this.createErrorFromResponse(response);
  }

  private handleErrorResponse(error: any): Promise<never> {
    const message = this.extractErrorMessage(error);
    
    if (message === "Unauthenticated.") {
      this.handleAuthError();
    }
    
    const config = (error.config || {}) as ApiRequestConfig;
    this.showErrorIfNeeded(config, error.response?.data?.errors, message);
    
    return Promise.reject(createError(message, error.response?.data?.errors));
  }

  private createErrorFromResponse(response: any): Promise<never> {
    const message = response.data?.message || "API returned an error status";
    const errors = response.data?.errors;
    const config = response.config as ApiRequestConfig;
    
    this.showErrorIfNeeded(config, errors, message);
    
    return Promise.reject(createError(message, errors));
  }

  private extractErrorMessage(error: any): string {
    return error.response?.data?.message || 
           (error.request ? "No response from server" : error.message) || 
           "An error occurred";
  }

  private showErrorIfNeeded(config: ApiRequestConfig, errors: any, message: string): void {
    const showToast = config.showToast !== false;
    if (!showToast) return;

    if (Array.isArray(errors) && errors.length > 0) {
      showError(formatErrorMessages(errors), "Error");
    } else {
      showError(message, "Error");
    }
  }

  private async getValidToken(): Promise<string | null> {
    // Return cached token if valid
    if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    // Wait for existing session request
    if (this.sessionPromise) {
      const session = await this.sessionPromise;
      return session?.accessToken || null;
    }

    // Create new session request
    this.sessionPromise = this.createSessionRequest();
    
    try {
      const session = await this.sessionPromise;
      const token = session?.accessToken || null;

      if (token) {
        this.cachedToken = token;
        this.tokenExpiry = Date.now() + TOKEN_CACHE_DURATION;
      }

      return token;
    } finally {
      this.sessionPromise = null;
    }
  }

  private createSessionRequest(): Promise<any> {
    return typeof window === "undefined" 
      ? getServerSession(authOptions) 
      : getSession();
  }

  private handleAuthError(): void {
    this.refreshToken();
    signOut();
  }

  public refreshToken(): void {
    this.cachedToken = null;
    this.tokenExpiry = null;
    this.sessionPromise = null;
  }

  private mergeConfig(config?: ApiRequestConfig): ApiRequestConfig {
    return { showToast: true, ...config };
  }

  private async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    const mergedConfig = this.mergeConfig(config);
    return await this.axiosInstance[method](endpoint, data, mergedConfig);
  }

  // Public API methods
  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('get', endpoint, undefined, config);
  }

  async post<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('post', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('put', endpoint, data, config);
  }

  async patch<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('patch', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('delete', endpoint, undefined, config);
  }
}

export const apiClient = new ApiClient(`${API_BASE_URL}/api/v1`);