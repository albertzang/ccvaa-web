import { z } from "zod";

/** Max length for display / join / newsletter names. */
export const PERSON_NAME_MAX_LENGTH = 200;

/**
 * International-friendly person name: required, trimmed, Unicode letters +
 * combining marks, spaces, and common punctuation (hyphen, apostrophe, period,
 * middle dot, comma). Rejects empty/whitespace and ASCII-only digit/symbol junk.
 */
export const personNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required.")
  .max(PERSON_NAME_MAX_LENGTH, "Name is too long.")
  .refine((value) => /\p{L}/u.test(value), {
    message: "Enter a valid name.",
  })
  .refine(
    (value) => /^[\p{L}\p{M}\p{Zs}\p{Pd}'’\.·,]+$/u.test(value),
    {
      message:
        "Name may include letters, spaces, and common punctuation only.",
    },
  );

export type PersonName = z.infer<typeof personNameSchema>;
