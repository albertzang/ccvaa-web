import { redirect } from "next/navigation";

import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MembershipSection } from "@/components/MembershipSection";
import type { UnsubLanding } from "@/components/MembershipPanel";

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
