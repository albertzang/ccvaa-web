export class MembersDbError extends Error {
  readonly code = "MEMBERS_DB_UNAVAILABLE" as const;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "MembersDbError";
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function isMembersDbError(error: unknown): error is MembersDbError {
  return (
    error instanceof MembersDbError ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: unknown }).name === "MembersDbError" &&
      "code" in error &&
      (error as { code: unknown }).code === "MEMBERS_DB_UNAVAILABLE")
  );
}

/** True for missing-relation / unmigrated-schema style Postgres errors. */
export function isMembersSchemaUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as {
    code?: unknown;
    message?: unknown;
    cause?: unknown;
  };

  if (record.code === "42P01" || record.code === "42703") {
    return true;
  }

  const message =
    typeof record.message === "string" ? record.message.toLowerCase() : "";
  if (
    message.includes("does not exist") ||
    message.includes("undefined_table") ||
    message.includes("undefined_column") ||
    (message.includes("relation") && message.includes("exist"))
  ) {
    return true;
  }

  if (record.cause !== undefined) {
    return isMembersSchemaUnavailableError(record.cause);
  }

  return false;
}

/**
 * Wraps unknown DB/driver failures as MembersDbError (503 fail-closed).
 * Passes through MembersDbError unchanged.
 */
export function wrapMembersDbError(
  error: unknown,
  fallbackMessage = "Members database is unavailable.",
): MembersDbError {
  if (error instanceof MembersDbError) {
    return error;
  }

  if (isMembersSchemaUnavailableError(error)) {
    return new MembersDbError(
      "Members database schema is missing or incomplete. Run migrations against this DATABASE_URL.",
      { cause: error },
    );
  }

  const message =
    error instanceof Error && error.message.trim()
      ? error.message
      : fallbackMessage;

  return new MembersDbError(message, { cause: error });
}

export async function withMembersDbError<T>(
  operation: () => Promise<T>,
  fallbackMessage = "Members database is unavailable.",
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw wrapMembersDbError(error, fallbackMessage);
  }
}
