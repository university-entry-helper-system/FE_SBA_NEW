export interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dob: string;
  gender: string;
}
export interface User {
  accountId: string;
  roleId: number;
  roleName: string;
  email: string;
}
export interface DecodedToken {
  accountId: string;
  roleId: number;
  roleName: string;
  sub: string;
  iat: number;
  exp: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}
