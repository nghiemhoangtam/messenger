export interface JwtPayload {
  id: string;
  username: string;
  email?: string;
  roles: string[];
  iat?: number; // issued at
  exp?: number; // expiration time
  iss?: string; // issuer
}
