import { MembershipPanel, type MemberSessionSummary } from "@/components/MembershipPanel";
import { type JoinPlansProps } from "@/components/JoinForm";
import { getJoinPlans } from "@/lib/members/join";
import {
  getMemberProfileForSession,
  toPublicMemberProfile,
} from "@/lib/members/profile";
import {
  readMemberSession,
  toPublicMemberSession,
} from "@/lib/members/session";

type MembershipSectionProps = {
  joinedLanding?: boolean;
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

async function loadInitialProfile(): Promise<{
  profile: MemberSessionSummary | null;
  profileError: string | null;
}> {
  const payload = await readMemberSession();
  if (!payload) {
    return { profile: null, profileError: null };
  }

  try {
    const memberProfile = await getMemberProfileForSession(payload);
    return {
      profile: toPublicMemberProfile(memberProfile, payload.exp),
      profileError: null,
    };
  } catch (error) {
    return {
      profile: {
        ...toPublicMemberSession(payload),
        membershipAnniversary: null,
        nextRenewalAt: null,
      },
      profileError:
        error instanceof Error
          ? error.message
          : "Could not load your membership profile.",
    };
  }
}

export async function MembershipSection({
  joinedLanding,
}: MembershipSectionProps) {
  const [plansResult, initialProfileState] = await Promise.all([
    loadPlansForJoin(),
    loadInitialProfile(),
  ]);

  return (
    <section
      id="membership"
      className="scroll-mt-24 bg-ocean-50/80 py-14 sm:py-20"
      aria-label="Membership"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <MembershipPanel
            joinedLanding={joinedLanding}
            initialProfile={initialProfileState.profile}
            initialProfileError={initialProfileState.profileError}
            initialPlans={plansResult.ok ? plansResult.data : null}
            initialPlansError={plansResult.ok ? null : plansResult.message}
          />
        </div>
      </div>
    </section>
  );
}
