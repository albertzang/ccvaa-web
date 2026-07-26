import type { MemberProfileSummary } from "@/components/MembershipPanel";
import {
  getMemberProfileForSession,
  toPublicMemberProfile,
} from "@/lib/members/profile";
import {
  readMemberSession,
  toPublicMemberSession,
} from "@/lib/members/session";

export async function loadInitialMemberProfile(): Promise<{
  profile: MemberProfileSummary | null;
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
        newsletterStatus: "off",
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
