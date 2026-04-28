import { createApiClient, normalizeApiError } from "@/services/http/client";
import type {
  AuthTokenResponse,
  ForgotPasswordPayload,
  MessageResponse,
  RegisterResponse,
  ResetPasswordPayload,
  UserLoginPayload,
  UserRegisterPayload,
  UserResponse
} from "@/types/api/auth";

export const authService = {
  async login(payload: UserLoginPayload): Promise<AuthTokenResponse> {
    try {
      const { data } = await createApiClient().post<AuthTokenResponse>("/auth/login", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async register(payload: UserRegisterPayload): Promise<RegisterResponse> {
    try {
      const { data } = await createApiClient().post<RegisterResponse>("/auth/register", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getMe(token: string): Promise<UserResponse> {
    try {
      const { data } = await createApiClient(token).get<UserResponse>("/auth/me");
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<MessageResponse> {
    try {
      const { data } = await createApiClient().post<MessageResponse>(
        "/auth/password/forgot",
        null,
        {
          params: {
            email: payload.email
          }
        }
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
    try {
      const { data } = await createApiClient().post<MessageResponse>("/auth/password/reset", null, {
        params: {
          token: payload.token,
          new_password: payload.new_password
        }
      });
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
