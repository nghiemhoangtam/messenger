import { TFunction } from "i18next";

const ns = "auth";

export const login = (t: TFunction) =>
  t("login", {
    ns,
    defaultValue: "Login",
  });

export const register = (t: TFunction) =>
  t("register", {
    ns,
    defaultValue: "Register",
  });

export const do_have_account = (t: TFunction) =>
  t("do_have_account", {
    ns,
    defaultValue: "Don't have an account?",
  });

export const do_not_have_account = (t: TFunction) =>
  t("do_not_have_account", {
    ns,
    defaultValue: "Don't have an account?",
  });

export const register_now = (t: TFunction) =>
  t("register_now", {
    ns,
    defaultValue: "Register now",
  });

export const password_not_match = (t: TFunction) =>
  t("password_not_match", {
    ns,
    defaultValue: "Confirmation password does not match",
  });

export const new_account = (t: TFunction) =>
  t("new_account", {
    ns,
    defaultValue: "Create new account",
  });

export const have_not_receive_email = (t: TFunction) =>
  t("have_not_receive_email", {
    ns,
    defaultValue: "Haven't received the verification email yet?",
  });

export const resend = (t: TFunction) =>
  t("resend", {
    ns,
    defaultValue: "Resend",
  });
