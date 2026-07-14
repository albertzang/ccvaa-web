import { JoinForm, type JoinPlansProps } from "@/components/JoinForm";
import { getJoinPlans } from "@/lib/members/join";
import { membershipContent } from "@/lib/site";

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

export async function MembershipSection({
  joinedLanding,
}: MembershipSectionProps) {
  const plansResult = await loadPlansForJoin();

  return (
    <section
      id="membership"
      className="scroll-mt-24 bg-ocean-50/80 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ocean-900 sm:text-4xl">
            {membershipContent.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ocean-600">
            {membershipContent.description}
          </p>
          <JoinForm
            joinedLanding={joinedLanding}
            initialPlans={plansResult.ok ? plansResult.data : null}
            initialPlansError={plansResult.ok ? null : plansResult.message}
          />
        </div>
      </div>
    </section>
  );
}
