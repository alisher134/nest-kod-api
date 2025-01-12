export type I18nTranslations = {
  auth: {
    isExist: string;
    invalid: string;
    refreshTokenMissing: string;
    refreshTokenInvalid: string;
    rights: string;
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
      gender: {
        enum: string;
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
