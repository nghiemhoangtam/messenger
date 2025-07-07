import { message } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { ErrorState } from "../types/error";
import {
  BUSINESS_ERROR,
  TOO_MANY_REQUESTS,
  VALIDATION_ERROR,
} from "../utils/constants/constant";
import * as translator from "../utils/translator";

export function useShowError(error: ErrorState) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      if (error.code === BUSINESS_ERROR || error.code === VALIDATION_ERROR) {
        error.messages.forEach((element) => {
          message.error(
            translator.message.getMessageWithParams(
              t,
              element.code,
              element.params,
            ),
          );
        });
      } else if (error.code === TOO_MANY_REQUESTS) {
        message.error(translator.common.too_many_requests(t));
      } else {
        message.error(translator.common.internal_server(t));
      }
    }
  }, [error, dispatch, t]);
}
