import { MembersDbError } from "@/lib/members/errors";
import { MembersEnvError } from "@/lib/members/env";
import { countActivePaidMembers } from "@/lib/members/join";
import { countNewsletterSubscribers } from "@/lib/members/newsletter";

export type HeroCounts = {
  newsletterSubscribers: number;
  paidMembers: number;
};

/** Live hero counters; stubs zeros when the members DB is unavailable. */
export async function getHeroCounts(): Promise<HeroCounts> {
  try {
    const [newsletterSubscribers, paidMembers] = await Promise.all([
      countNewsletterSubscribers(),
      countActivePaidMembers(),
    ]);
    return { newsletterSubscribers, paidMembers };
  } catch (error) {
    if (error instanceof MembersDbError || error instanceof MembersEnvError) {
      return { newsletterSubscribers: 0, paidMembers: 0 };
    }
    throw error;
  }
}
