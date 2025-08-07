export interface Account {
  id: string;
  username: string;
  email:string | undefined;
  password: any;
  role: string;
  status?: boolean;
  lastTokenIat?: number;
}

export interface Role {
  id: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
}

export interface TokenRefreshResponse {
  success: boolean;
  token?: string;
  error?: string;
}
