import apiService from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
} from "../types";

const TOKEN_KEY = "auth_token";

export const AuthService = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse>("/auth/register", payload);
    if (res.success && res.data?.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
    }
    return res.data;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse>("/auth/login", payload);
    if (res.success && res.data?.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
    }
    return res.data;
  },

  async me(): Promise<UserProfile> {
    const res = await apiService.get<UserProfile>("/auth/me");
    return res.data;
  },

  async updateProfile(name: string): Promise<UserProfile> {
    const res = await apiService.put<UserProfile>("/auth/me", { name });
    return res.data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiService.post<void>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  async deleteAccount(): Promise<void> {
    await apiService.delete<void>("/auth/me");
    this.logout();
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
