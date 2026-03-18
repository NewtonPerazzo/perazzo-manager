import type { UUID } from "@/types/api/common";

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: "bearer";
}

export interface UserRegisterPayload {
  name?: string;
  last_name?: string;
  email: string;
  password: string;
  birth_date?: string;
  photo?: string;
}

export interface RegisterResponse {
  id: UUID;
  email: string;
  email_verification_token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  reset_token: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface MessageResponse {
  message: string;
}

export interface UserResponse {
  id: UUID;
  name?: string;
  last_name?: string;
  email: string;
  birth_date?: string;
  photo?: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
}
