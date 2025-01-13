export const AUTH_CONSTANTS = {
  MAX_FAILED_ATTEMPTS: 5,
  BLOCK_DURATION: 900,
  ATTEMPTS_KEY: (email: string): string => `auth:attempts:${email}`,
  BLOCK_KEY: (email: string): string => `auth:block:${email}`,
};
