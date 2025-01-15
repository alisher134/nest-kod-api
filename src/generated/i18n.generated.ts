export type I18nTranslations = {
  auth: {
    isExist: string;
    invalid: string;
    invalidRestoreToken: string;
    refreshTokenMissing: string;
    refreshTokenInvalid: string;
    rights: string;
    tooManyAttempts: string;
    IsPasswordsMatchingConstraint: string;
  };
  user: {
    notFound: string;
    validation: {
      email: {
        required: string;
        invalid: string;
      };
      password: {
        required: string;
        min: string;
      };
      passwordConfirm: {
        required: string;
        match: string;
      };
      firstName: {
        required: string;
        min: string;
      };
      lastName: {
        required: string;
        min: string;
      };
      description: {
        required: string;
        min: string;
      };
      role: {
        enum: string;
      };
      avatarPath: {
        isString: string;
      };
    };
  };
};
