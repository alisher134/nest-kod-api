export const TOKEN_CONSTANTS = {
  ACCESS_TOKEN_EXP: '15m',
  ACCESS_TOKEN_SECRET: 'JWT_ACCESS_SECRET',
  REFRESH_TOKEN_EXP: '7d',
  REFRESH_TOKEN_TTL: 604800,
  REFRESH_TOKEN_COOKIE: 'refreshToken',
  REFRESH_TOKEN_COOKIE_EXP: 7,
  REFRESH_TOKEN_SECRET: 'JWT_REFRESH_SECRET',
  RESTORE_TOKEN_SECRET: 'JWT_RESTORE_SECRET',
  RESTORE_TOKEN_EXP: '1h',
  ACCESS_TOKEN_KEY: (userId: string): string => `accessToken:${userId}`,
  REFRESH_TOKEN_KEY: (userId: string): string => `refreshToken:${userId}`,
};
