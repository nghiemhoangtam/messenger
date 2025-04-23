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
    };
  }
}
