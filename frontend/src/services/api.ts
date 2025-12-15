import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { ApiConfig, ApiError, ApiResponse, RequestConfig } from "../types";

// Error codes that require automatic logout
const AUTH_ERROR_CODES = [
  "USER_NOT_FOUND",
  "INVALID_TOKEN",
  "AUTHENTICATION_REQUIRED",
];

class ApiService {
  private api: AxiosInstance;
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = {
      baseURL:
        config.baseURL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5002/api",
      timeout: config.timeout || 10000,
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

  /**
   * Handle automatic logout when user session is invalid (deleted user, expired token, etc.)
   */
  private handleAuthError(): void {
    localStorage.removeItem("auth_token");
    // Redirect to login page
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  /**
   * Check if error requires automatic logout
   */
  private isAuthError(error: AxiosError): boolean {
    const status = error.response?.status;
    const responseData = error.response?.data as { code?: string } | undefined;
    const errorCode = responseData?.code;

    // Check for 401 with specific auth error codes
    if (status === 401 && errorCode && AUTH_ERROR_CODES.includes(errorCode)) {
      return true;
    }

    return false;
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
      (error: AxiosError) => {
        // Check if this is an auth error that requires logout
        if (this.isAuthError(error)) {
          this.handleAuthError();
        }
        return Promise.reject(this.handleError(error));
      }
    );
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
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5002/api",
  timeout: 10000,
});

export default apiService;
