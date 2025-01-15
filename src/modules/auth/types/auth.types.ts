export type TAccessToken = {
  accessToken: string;
};

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthTokenPayload {
  id: string;
}

export interface IRestoreTokenPayload {
  id: string;
  email: string;
}
