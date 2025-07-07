import { AxiosResponse } from "axios";
import { VALIDATION_ERROR } from "../constants/constant";
import { BusinessError, InternalServerError, ValidationError } from "../errors";

async function safeRequest<T>(fn: () => Promise<T>) {
  try {
    const res: T = await fn();
    return res;
  } catch (err: any) {
    if (err.response?.data) {
      const { code, messages } = err.response.data;
      if (VALIDATION_ERROR === code) {
        throw new ValidationError(messages);
      } else {
        throw new BusinessError(messages);
      }
    }
    throw new InternalServerError();
  }
}

export function apiRequest<T>(
  request: () => Promise<AxiosResponse<T>>
): Promise<T> {
  return safeRequest(() =>
    request()
      .then((res: { data: any }) => res.data.data)
      .catch((err) => {
        throw err;
      })
  );
}
