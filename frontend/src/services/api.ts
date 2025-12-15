import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { ApiConfig, ApiError, ApiResponse, RequestConfig } from "../types";

class ApiService {
  private api: AxiosInstance;
  private config: ApiConfig;
  private retryCount: number = 0;
  constructor(config: ApiConfig) {
    this.config = {
      baseURL: config.baseURL || import.meta.env.VITE_API_URL || "http://localhost:5002/api",
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };

    this.api = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem("auth_token");
        if (token) {
          const headers = new AxiosHeaders(config.headers);
          headers.set("Authorization", `Bearer ${token}`);
          config.headers = headers;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        if (
          (error.config as any)?.retry !== false &&
          this.retryCount < (this.config.retryAttempts || 3)
        ) {
          this.retryCount++;
          await this.delay(this.config.retryDelay || 1000);
          return this.api(error.config as InternalAxiosRequestConfig);
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleError(error: AxiosError): ApiError {
    const apiError: ApiError = new Error(error.message);
    apiError.status = error.response?.status;
    apiError.code = error.code;
    apiError.response = error.response?.data;
    return apiError;
  }

  public async get<T>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async delete<T>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5002/api",
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
});

export default apiService;
