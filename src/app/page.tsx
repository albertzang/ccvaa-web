import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import {
  MembershipSection,
} from "@/components/MembershipSection";
import type { UnsubLanding } from "@/components/MembershipPanel";
import {
  isMembersNewsletterError,
  redeemUnsubToken,
} from "@/lib/members/newsletter";
import { MembersDbError } from "@/lib/members/errors";
import {
  MembersEnvError,
  requireDatabaseUrl,
} from "@/lib/members/env";
import {
  getMemberProfileForSession,
  toPublicMemberProfile,
} from "@/lib/members/profile";
import {
  createMemberSessionToken,
  isMemberSessionSecretConfigured,
  setMemberSessionCookie,
} from "@/lib/members/session";
import { unsubTokenValueSchema } from "@/lib/members/zod/unsub-token";

async function resolveUnsubLanding(
  token: string | undefined,
): Promise<UnsubLanding | undefined> {
  if (!token) {
    return undefined;
  }

  const parsed = unsubTokenValueSchema.safeParse(token);
  if (!parsed.success) {
    return { kind: "invalid" };
  }

  try {
    requireDatabaseUrl();
    const result = await redeemUnsubToken({ token: parsed.data });

    if (!isMemberSessionSecretConfigured()) {
      return {
        kind: "success",
        already: result.alreadyUnsubscribed,
        email: result.email,
      };
    }

    const { token: sessionToken, expiresAt, payload } =
      createMemberSessionToken({
        memberId: result.memberId,
        email: result.email,
        name: result.name,
        plan: result.plan,
      });
    await setMemberSessionCookie(sessionToken, expiresAt);

    const memberProfile = await getMemberProfileForSession(payload);
    const profile = toPublicMemberProfile(memberProfile, payload.exp);

    return {
      kind: "success",
      already: result.alreadyUnsubscribed,
      email: result.email,
      profile,
    };
  } catch (error) {
    if (
      isMembersNewsletterError(error) ||
      error instanceof MembersEnvError ||
      error instanceof MembersDbError
    ) {
      return { kind: "invalid" };
    }
    throw error;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    unsub?: string | string[];
    joined?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawToken = Array.isArray(params.unsub) ? params.unsub[0] : params.unsub;
  const unsubLanding = await resolveUnsubLanding(rawToken);
  const joinedRaw = Array.isArray(params.joined)
    ? params.joined[0]
    : params.joined;
  const joinedLanding = joinedRaw === "1";

  return (
    <>
      <Header />
      <main>
        <Hero />
        <MembershipSection
          joinedLanding={joinedLanding}
          unsubLanding={unsubLanding}
        />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
