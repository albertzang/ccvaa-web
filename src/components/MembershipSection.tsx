import {
  MembershipPanel,
  type UnsubLanding,
} from "@/components/MembershipPanel";
import { type JoinPlansProps } from "@/components/JoinForm";
import { getHeroCounts } from "@/lib/members/hero-counts";
import { getJoinPlans } from "@/lib/members/join";
import { loadInitialMemberProfile } from "@/lib/members/load-member-profile";

type MembershipSectionProps = {
  joinedLanding?: boolean;
  unsubLanding?: UnsubLanding;
};

async function loadPlansForJoin(): Promise<
  | { ok: true; data: JoinPlansProps }
  | { ok: false; message: string }
> {
  try {
    const data = await getJoinPlans();
    return {
      ok: true,
      data: {
        foundingCap: data.foundingCap,
        foundingSeatsTaken: data.foundingSeatsTaken,
        foundingSeatsRemaining: data.foundingSeatsRemaining,
        offeringOneTime: data.offeringOneTime,
        plans: data.plans,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Membership join is unavailable right now.",
    };
  }
}

/** Verified-session membership portal only (gate lives in Hero when logged out). */
export async function MembershipSection({
  joinedLanding,
  unsubLanding,
}: MembershipSectionProps) {
  const [plansResult, initialProfileState, heroCounts] = await Promise.all([
    loadPlansForJoin(),
    loadInitialMemberProfile(),
    getHeroCounts(),
  ]);

  const authenticated = Boolean(initialProfileState.profile?.authenticated);
  if (!authenticated && !unsubLanding) {
    return null;
  }

  return (
    <section
      id="membership"
      className="relative scroll-mt-24 py-10 sm:py-14"
      aria-label="Membership"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl">
          <MembershipPanel
            joinedLanding={joinedLanding}
            unsubLanding={unsubLanding}
            initialProfile={initialProfileState.profile}
            initialProfileError={initialProfileState.profileError}
            initialPlans={plansResult.ok ? plansResult.data : null}
            initialPlansError={plansResult.ok ? null : plansResult.message}
            initialHeroCounts={authenticated ? heroCounts : null}
          />
        </div>
      </div>
    </section>
  );
}
