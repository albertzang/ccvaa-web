import { AboutSection } from "@/components/AboutSection";
import {
  ContactSection,
  type UnsubLandingProps,
} from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import {
  isMembersNewsletterError,
  redeemUnsubToken,
} from "@/lib/members/newsletter";
import { MembersDbError } from "@/lib/members/errors";
import { MembersEnvError } from "@/lib/members/env";
import { unsubTokenValueSchema } from "@/lib/members/zod/unsub-token";

async function resolveUnsubLanding(
  token: string | undefined,
): Promise<UnsubLandingProps | undefined> {
  if (!token) {
    return undefined;
  }

  const parsed = unsubTokenValueSchema.safeParse(token);
  if (!parsed.success) {
    return { kind: "invalid" };
  }

  try {
    const result = await redeemUnsubToken({ token: parsed.data });
    return { kind: "success", already: result.alreadyUnsubscribed };
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
  searchParams: Promise<{ unsub?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawToken = Array.isArray(params.unsub) ? params.unsub[0] : params.unsub;
  const unsubLanding = await resolveUnsubLanding(rawToken);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <ContactSection unsubLanding={unsubLanding} />
      </main>
      <Footer />
    </>
  );
}
