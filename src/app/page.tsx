import { redirect } from "next/navigation";

import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MembershipSection } from "@/components/MembershipSection";
import type { UnsubLanding } from "@/components/MembershipPanel";
import { isFeatureEnabled } from "@/lib/flags/read";
import { membershipContent } from "@/lib/site";

function resolveUnsubLandingFromStatus(
  status: string | undefined,
): UnsubLanding | undefined {
  if (!status) {
    return undefined;
  }
  if (status === "invalid") {
    return { kind: "invalid" };
  }
  if (status === "1" || status === "already") {
    return {
      kind: "success",
      already: status === "already",
      email: "",
    };
  }
  return { kind: "invalid" };
}

function UnsubConfirmation({ landing }: { landing: UnsubLanding }) {
  const message =
    landing.kind === "invalid"
      ? membershipContent.unsubLandingInvalid
      : landing.already
        ? membershipContent.unsubLandingAlready
        : membershipContent.unsubLandingSuccess;

  return (
    <section
      id="membership"
      className="scroll-mt-24 bg-ocean-50/80 py-14 sm:py-20"
      aria-label="Newsletter preference"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-ocean-200 bg-white p-6 text-ocean-800 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-ocean-900">
            Newsletter preference
          </h2>
          <p className="mt-3 text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </section>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    unsub?: string | string[];
    unsubscribed?: string | string[];
    joined?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawToken = Array.isArray(params.unsub) ? params.unsub[0] : params.unsub;

  // Redeem + Set-Cookie must run in a Route Handler, not this RSC page.
  if (rawToken) {
    redirect(
      `/api/members/newsletter/unsub/landing?token=${encodeURIComponent(rawToken)}`,
    );
  }

  const unsubscribedRaw = Array.isArray(params.unsubscribed)
    ? params.unsubscribed[0]
    : params.unsubscribed;
  const unsubLanding = resolveUnsubLandingFromStatus(unsubscribedRaw);

  const joinedRaw = Array.isArray(params.joined)
    ? params.joined[0]
    : params.joined;
  const joinedLanding = joinedRaw === "1";
  const membersEnabled = await isFeatureEnabled("members");

  return (
    <>
      <Header membersEnabled={membersEnabled} />
      <main>
        <Hero membersEnabled={membersEnabled} />
        {membersEnabled ? (
          <MembershipSection
            joinedLanding={joinedLanding}
            unsubLanding={unsubLanding}
          />
        ) : (
          unsubLanding && <UnsubConfirmation landing={unsubLanding} />
        )}
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
