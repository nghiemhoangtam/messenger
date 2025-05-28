import { TFunction } from "i18next";
import capitalize from "lodash/capitalize";

const ns = "common";
export const welcome = (t: TFunction) =>
  t("welcome", {
    ns,
    defaultValue: "Welcome to our app",
  });

export const email = (t: TFunction) =>
  t("email", {
    ns,
    defaultValue: "Email",
  });

export const pass = (t: TFunction) =>
  t("pass", {
    ns,
    defaultValue: "Password",
  });

export const enter_field_message = (t: TFunction, field: string) =>
  t("enter_field_message", {
    ns,
    defaultValue: `Enter your ${field.toLowerCase()}`,
    field: field.toLowerCase(),
  });

export const invalid_field_message = (t: TFunction, field: string) =>
  t("invalid_field_message", {
    ns,
    defaultValue: `${field} is invalid`,
    field,
  });

export const result_of = (t: TFunction, action: string) =>
  t("result_of", {
    ns,
    defaultValue: `Result of ${action.toLowerCase()}`,
    action: action.toLowerCase(),
  });

export const or = (t: TFunction) =>
  t("or", {
    ns,
    defaultValue: "Or",
  });

export const success_message = (t: TFunction, action: string) =>
  t("success_message", {
    ns,
    defaultValue: `${capitalize(action)} success`,
    action: capitalize(action),
  });

export const fail_message = (t: TFunction, action: string) =>
  t("fail_message", {
    ns,
    defaultValue: `${capitalize(action)} failed`,
    action: capitalize(action),
  });

export const display_name = (t: TFunction) =>
  t("display_name", {
    ns,
    defaultValue: "Display name",
  });

export const at_least_letter = (t: TFunction, field: string, amount: number) =>
  t("at_least_letter", {
    ns,
    defaultValue: `${capitalize(field)} at least ${amount} letter`,
    field: capitalize(field),
    amount,
  });

export const confirmation = (t: TFunction) =>
  t("confirmation", {
    ns,
    defaultValue: `confirmation`,
  });

export const validate_field = (t: TFunction, field: string) =>
  t("validate_field", {
    ns,
    defaultValue: `${capitalize(field)} validation`,
    field: capitalize(field),
  });

export const check_field = (t: TFunction, field: string) =>
  t("check_field", {
    ns,
    defaultValue: `Check ${field.toLowerCase()}`,
    field: field.toLowerCase(),
  });

export const prompt_field_confirm = (t: TFunction, field: string) =>
  t("prompt_field_confirm", {
    ns,
    defaultValue: `Please confirm ${field.toLowerCase()}`,
    field: field.toLowerCase(),
  });

export const account = (t: TFunction) =>
  t("account", {
    ns,
    defaultValue: `account`,
  });

export const internal_server = (t: TFunction) =>
  t("internal_server", {
    ns,
    defaultValue: `Internal server error`,
  });

export const too_many_requests = (t: TFunction) =>
  t("too_many_requests", {
    ns,
    defaultValue: `Too many requests, please try again later`,
  });
