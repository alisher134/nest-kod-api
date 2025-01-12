export type TokenType = 'access' | 'refresh';

export interface TokenConfig {
  expiresIn: string;
  secret?: string;
}

export type TokenConfigs = {
  [key in TokenType]: TokenConfig;
};

export interface BaseTokenPayload {
  id: string;
}
