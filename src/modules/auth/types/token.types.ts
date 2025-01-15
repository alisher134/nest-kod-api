export type TTokenType = 'accessToken' | 'refreshToken' | 'restore';
export interface IBaseTokenPayload {
  id: string;
}

export interface ITokenOptions {
  secret: string;
  expiresIn?: string;
  ttl?: number;
}
