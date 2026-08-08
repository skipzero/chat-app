export type FieldErrorValue =
  | string
  | number
  | { message?: unknown }
  | null
  | undefined;

export function getErrorMessage(
  error: FieldErrorValue | unknown,
): string | undefined {
  if (typeof error === "string") return error;
  if (typeof error === "number") return String(error);
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.length > 0
  ) {
    return error.message;
  }
  return undefined;
}

export function getFirstError(
  errors: ReadonlyArray<unknown> | undefined,
): string | undefined {
  if (!errors || errors.length === 0) return undefined;
  for (const error of errors) {
    const message = getErrorMessage(error);
    if (message) return message;
  }
  return undefined;
}