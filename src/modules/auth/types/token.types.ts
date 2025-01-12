export type TTokenType = 'accessToken' | 'refreshToken';
export interface IBaseTokenPayload {
  id: string;
}

export interface ITokenOptions {
  secret: string;
  expiresIn?: string;
  ttl?: number;
}
