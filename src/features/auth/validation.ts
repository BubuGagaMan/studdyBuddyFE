// src/features/auth/validation.ts
import { ValidationError } from "@/shared/hooks/useAsyncAction";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;

export const PASSWORD_HINT =
  "At least 8 characters, with an uppercase letter, a lowercase letter, a number and a special character.";

export const CODE_LENGTH = 6;

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new ValidationError(message);
};

export const assertFilled = (...values: string[]) =>
  assert(values.every((v) => v.trim()), "Please fill in all fields.");

export const assertEmail = (email: string) =>
  assert(EMAIL_PATTERN.test(email.trim()), "Please enter a valid email address.");

export const assertPassword = (password: string) =>
  assert(PASSWORD_PATTERN.test(password), PASSWORD_HINT);

export const assertMatch = (a: string, b: string, what: string) =>
  assert(a === b, `${what} do not match.`);

export const assertCode = (code: string) =>
  assert(
    code.trim().length === CODE_LENGTH,
    `Please enter the ${CODE_LENGTH}-character code.`,
  );
