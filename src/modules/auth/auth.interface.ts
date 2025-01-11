export type TAccessToken = {
  accessToken: string;
};

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtPayload {
  id: string;
}
