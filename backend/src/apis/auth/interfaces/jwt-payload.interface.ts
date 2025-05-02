export interface JwtPayload {
  id: string;
  email: string;
  iat?: number; // issued at
  exp?: number; // expiration time
  iss?: string; // issuer
}
