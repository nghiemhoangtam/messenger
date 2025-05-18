import {
  BUSINESS_ERROR,
  INTERNAL_SERVER_ERROR,
  VALIDATION_ERROR,
} from "../constants/constant";

export class AppError extends Error {
  public code: string;
  public messages: any[];

  constructor(code: string, messages: any[]) {
    super(code);
    this.code = code;
    this.messages = messages;
  }
}

export class ValidationError extends AppError {
  constructor(messages: { params?: any; code: string }[]) {
    super(VALIDATION_ERROR, messages);
  }
}

export class BusinessError extends AppError {
  constructor(messages: { params?: any; code: string }[]) {
    super(BUSINESS_ERROR, messages);
  }
}

export class InternalServerError extends AppError {
  constructor() {
    super(INTERNAL_SERVER_ERROR, [{ message: "Something went wrong." }]);
  }
}
