export const TOKEN_CONSTANTS = {
  ACCESS_EXP: 'JWT_ACCESS_EXP',
  DEFAULT_ACCESS_EXP: '1m',
  REFRESH_EXP: 'JWT_REFRESH_EXP',
  DEFAULT_REFRESH_EXP: '7d',
  ACCESS_SECRET: 'JWT_ACCESS_SECRET',
  REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  REFRESH_TOKEN_COOKIE: 'refreshToken',
  REFRESH_TOKEN_COOKIE_EXP: 7,
  ACCESS_TOKEN_KEY: (userId: string): string => `accessToken:${userId}`,
  REFRESH_TOKEN_KEY: (userId: string): string => `refreshToken:${userId}`,
};
