import { message } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { resetStatusAndError } from "../features/auth/authSlice";
import { INTERNAL_SERVER } from "../utils/constants/message.constant";
import * as translator from "../utils/translator";

export function useInternalError(error: string | null) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      if (error === INTERNAL_SERVER) {
        message.error(translator.common.internal_server(t));
      } else {
        message.error(error);
      }
      dispatch(resetStatusAndError());
    }
  }, [error, dispatch, t]);
}
