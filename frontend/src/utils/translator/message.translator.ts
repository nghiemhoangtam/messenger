import { TFunction } from "i18next";

const ns = "messages";
export const getMessage = (t: TFunction, code: string) =>
  (t as any)(code, {
    ns,
    defaultValue: "NOT FOUND",
  });

export const getMessageWithParams = (t: TFunction, code: string, params: any) =>
  (t as any)(code, {
    ns,
    defaultValue: "NOT FOUND",
    params,
  });
