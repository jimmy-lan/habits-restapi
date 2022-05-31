import { UnprocessableEntityError } from "./UnprocessableEntityError";

export class QuotaExceededError extends UnprocessableEntityError {
  constructor(message?: string) {
    super(message || "Quota exceeded");

    Object.setPrototypeOf(this, QuotaExceededError.prototype);
  }
}
