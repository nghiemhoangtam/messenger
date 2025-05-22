import "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: {
        welcome: string;
        email: string;
        pass: string;
        display_name: string;
        enter_field_message: string;
        invalid_field_message: string;
        result_of: string;
        or: string;
        success_message: string;
        fail_message: string;
        at_least_letter: string;
        prompt_field_confirm: string;
        confirmation: string;
        validate_field: string;
        check_field: string;
        account: string;
        internal_server: string;
      };
      auth: {
        login: string;
        login_now: string;
        logout: string;
        register: string;
        register_now: string;
        do_not_have_account: string;
        do_have_account: string;
        password_not_match: string;
        new_account: string;
        have_not_receive_email: string;
        resend: string;
        forgot_password: string;
        remember_me: string;
        send_validate_code: string;
        new_password: string;
        setup_new_password: string;
      };
      messages: {
        INVALID_CREDENTIALS: string;
        TOKEN_NOT_PROVIDED: string;
        TOKEN_EXPIRED: string;
        INVALID_TOKEN: string;
        USER_ALREADY_EXISTS: string;
        VERIFY_EMAIL_SUBJECT: string;
        VERIFY_EMAIL_TEMPLATE: string;
        CORS_ORIGIN_MISSING: string;
        USER_NOT_FOUND: string;
        RESET_PASSWORD_SUBJECT: string;
        RESET_EMAIL_TEMPLATE: string;
        UNAUTHORIZED: string;
        FORBIDDEN: string;
        BAD_REQUEST: string;
        INTERNAL_SERVER: string;
        REFRESH_TOKEN_IS_USED: string;
      };
    };
  }
}
