import { UserResponse } from '../user/user.types';


export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;  // Issued at (automatically added)
  exp?: number;  // Expiry (automatically added)
}


export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}


export interface LoginResponse {
  user: UserResponse;
  tokens: AuthTokens;
}


export interface RefreshTokenRequest {
  refreshToken: string;
}


export interface TokenValidationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}