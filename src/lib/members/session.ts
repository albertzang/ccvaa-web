import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { MembersEnvError, isProductionRuntime } from "@/lib/members/env";
import {
  MEMBER_SESSION_COOKIE,
  MEMBER_SESSION_MAX_AGE_SEC,
  MEMBER_SESSION_TTL_MS,
} from "@/lib/members/session-config";
import type { MembershipPlan } from "@/lib/members/zod/membership";

export type MemberSessionPayload = {
  memberId: string;
  email: string;
  name: string | null;
  /** Paid plan or `none` for verified email without paid membership. */
  plan: MembershipPlan;
  exp: number;
};

export class MembersSessionError extends Error {
  readonly code: "MEMBERS_SESSION_INVALID" | "MEMBERS_SESSION_EXPIRED";

  constructor(
    code: MembersSessionError["code"],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "MembersSessionError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function getMemberSessionSecret(): string | undefined {
  const secret = process.env.MEMBER_SESSION_SECRET?.trim();
  return secret || undefined;
}

export function isMemberSessionSecretConfigured(): boolean {
  return Boolean(getMemberSessionSecret());
}

export function requireMemberSessionSecret(): string {
  const secret = getMemberSessionSecret();
  if (!secret) {
    throw new MembersEnvError(
      "MEMBER_SESSION_SECRET is not configured. Member login sessions are unavailable.",
    );
  }
  return secret;
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

function encodeSessionToken(payload: MemberSessionPayload, secret: string): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

function decodeSessionToken(token: string, secret: string): MemberSessionPayload {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new MembersSessionError(
      "MEMBERS_SESSION_INVALID",
      "Invalid member session.",
    );
  }

  const [payloadB64, signature] = parts;
  const expected = sign(payloadB64, secret);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new MembersSessionError(
      "MEMBERS_SESSION_INVALID",
      "Invalid member session.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch (error) {
    throw new MembersSessionError(
      "MEMBERS_SESSION_INVALID",
      "Invalid member session.",
      { cause: error },
    );
  }

  const payload = parsed as Partial<MemberSessionPayload>;
  if (
    typeof payload?.memberId !== "string" ||
    typeof payload?.email !== "string" ||
    typeof payload?.exp !== "number" ||
    (payload.plan !== "none" &&
      payload.plan !== "founding" &&
      payload.plan !== "lifetime" &&
      payload.plan !== "annual")
  ) {
    throw new MembersSessionError(
      "MEMBERS_SESSION_INVALID",
      "Invalid member session.",
    );
  }

  if (payload.exp <= Date.now()) {
    throw new MembersSessionError(
      "MEMBERS_SESSION_EXPIRED",
      "Member session has expired. Please verify your email again.",
    );
  }

  return {
    memberId: payload.memberId,
    email: payload.email.trim().toLowerCase(),
    name: typeof payload.name === "string" ? payload.name : null,
    plan: payload.plan,
    exp: payload.exp,
  };
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true as const,
    secure: isProductionRuntime() || process.env.VERCEL_ENV === "preview",
    sameSite: "lax" as const,
    path: "/",
    expires,
    maxAge: MEMBER_SESSION_MAX_AGE_SEC,
  };
}

/** Creates a signed session token for a verified member (paid or newsletter-only). */
export function createMemberSessionToken(input: {
  memberId: string;
  email: string;
  name: string | null;
  plan: MembershipPlan;
}): { token: string; expiresAt: Date; payload: MemberSessionPayload } {
  const secret = requireMemberSessionSecret();
  const expiresAt = new Date(Date.now() + MEMBER_SESSION_TTL_MS);
  const payload: MemberSessionPayload = {
    memberId: input.memberId,
    email: input.email.trim().toLowerCase(),
    name: input.name,
    plan: input.plan,
    exp: expiresAt.getTime(),
  };
  return {
    token: encodeSessionToken(payload, secret),
    expiresAt,
    payload,
  };
}

/** Requires a valid member session cookie or throws. */
export async function requireMemberSession(): Promise<MemberSessionPayload> {
  const payload = await readMemberSession();
  if (!payload) {
    throw new MembersSessionError(
      "MEMBERS_SESSION_INVALID",
      "Verify your email to manage newsletter and membership.",
    );
  }
  return payload;
}

/** Reads and verifies the member session cookie. Returns null when missing/invalid. */
export async function readMemberSession(): Promise<MemberSessionPayload | null> {
  const secret = getMemberSessionSecret();
  if (!secret) {
    return null;
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    return decodeSessionToken(raw, secret);
  } catch {
    return null;
  }
}

/** Sets the httpOnly member session cookie (Route Handler / Server Action only). */
export async function setMemberSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(MEMBER_SESSION_COOKIE, token, cookieOptions(expiresAt));
}

/** Clears the member session cookie. Does not touch admin/Hover cookies. */
export async function clearMemberSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(MEMBER_SESSION_COOKIE, "", {
    ...cookieOptions(new Date(0)),
    maxAge: 0,
  });
}

/**
 * Public session summary for UI/API — never implies `/admin` access.
 * Admin auth remains Hover mailbox session only.
 */
export function toPublicMemberSession(payload: MemberSessionPayload) {
  return {
    authenticated: true as const,
    memberId: payload.memberId,
    email: payload.email,
    name: payload.name,
    plan: payload.plan,
    expiresAt: new Date(payload.exp).toISOString(),
    /** Explicit: member cookie never authorizes `/admin`. */
    grantsAdmin: false as const,
  };
}
