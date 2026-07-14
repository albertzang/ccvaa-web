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
