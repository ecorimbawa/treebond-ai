/**
 * Mongo reports a unique-index violation as error code 11000 on a generic
 * write error, which otherwise lands in a catch block and becomes an opaque
 * 500. Callers use this to turn it into a 409 the operator can act on.
 */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}
