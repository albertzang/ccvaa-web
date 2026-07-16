export const siteConfig = {
  name: "Coast to Coast Visual Arts Association",
  shortName: "CCVAA",
  navTitle: "Coast to Coast",
  navSubtitle: "Visual Arts Association",
  tagline: "Connecting communities through visual arts across Canada",
  description:
    "A British Columbia–based non-profit fostering visual arts education, exhibitions, and community engagement from coast to coast.",
  url: "https://ccvaa.ca",
  locale: "en-CA",
  logo: {
    src: "/images/logo-ondark.png",
    srcOnLight: "/images/logo-onlight.png",
    alt: "Coast to Coast",
    width: 762,
    height: 206,
  },
} as const;

export const organization = {
  legalName: "Coast to Coast Visual Arts Association",
  jurisdiction: "British Columbia, Canada",
  registrationNote:
    "Registered non-profit organization in British Columbia, Canada.",
  founded: "2024", // Placeholder — update with actual year
  email: "info@ccvaa.ca",
  location: "Richmond, British Columbia, Canada",
  address: {
    line1: "4 – 8800 Hazelbridge Way",
    city: "Richmond",
    province: "BC",
    postalCode: "V6X 0S3",
    country: "Canada",
  },
  formattedAddress:
    "4 – 8800 Hazelbridge Way, Richmond, BC V6X 0S3, Canada",
} as const;

export const navigation = [
  { label: "Membership", href: "#membership" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export const heroContent = {
  eyebrow: "Non-profit · British Columbia, Canada",
  headline: "Celebrating visual arts from coast to coast",
  subheadline:
    "We bring artists, educators, and communities together to create, learn, and share the power of visual expression.",
  subscribeLabel: "Subscribe",
  joinLabel: "Join",
  newsletterCountLabel: "Newsletter subscribers",
  paidMembersCountLabel: "Paid members",
} as const;

export const aboutContent = {
  title: "About CCVAA",
  paragraphs: [
    "Coast to Coast Visual Arts Association (CCVAA) is a registered non-profit society in British Columbia, dedicated to advancing visual arts across Canada.",
    "We bring artists, educators, and communities together through exhibitions, education, and cultural programming — from local workshops to coast-to-coast collaboration.",
    "Whether you are an artist, educator, volunteer, or art enthusiast, we invite you to join our growing community.",
  ],
  purposesHeading: "Our Purposes",
  purposes: [
    {
      title: "Advancement of Visual Arts",
      description:
        "To promote, support, and advance the creation, appreciation, study, and public understanding of visual arts, including but not limited to photography, painting, drawing, printmaking, sculpture, digital art, mixed media, installation art, and emerging artistic practices.",
    },
    {
      title: "Artistic Development",
      description:
        "To encourage artistic excellence, innovation, experimentation, and professional development among artists, photographers, educators, curators, students, and art enthusiasts.",
    },
    {
      title: "Exhibitions and Public Programs",
      description:
        "To organize, sponsor, and present exhibitions, festivals, lectures, workshops, artist talks, screenings, publications, and other cultural activities that foster public engagement with the arts.",
    },
    {
      title: "Education",
      description:
        "To provide educational opportunities that increase knowledge, skills, and appreciation of visual arts through instruction, mentorship, outreach programs, and lifelong learning initiatives.",
    },
    {
      title: "Cultural Exchange",
      description:
        "To facilitate local, national, and international artistic and cultural exchange, collaboration, and dialogue among artists, cultural organizations, educational institutions, and communities.",
    },
    {
      title: "Community Engagement",
      description:
        "To strengthen community participation in the arts and contribute to cultural vitality through inclusive, accessible, and diverse artistic programming.",
    },
    {
      title: "Preservation and Documentation",
      description:
        "To support the preservation, documentation, publication, and dissemination of artistic works, cultural heritage, and contemporary artistic practices.",
    },
    {
      title: "Support for Artists",
      description:
        "To provide opportunities, resources, recognition, networking, and professional support for artists and photographers at all stages of their careers.",
    },
    {
      title: "Public Benefit",
      description:
        "To carry on activities that benefit the public by promoting creativity, cultural understanding, artistic expression, and participation in the arts.",
    },
    {
      title: "Non-Profit Purpose",
      description:
        "The Society shall operate exclusively on a non-profit basis and shall not distribute any income or assets to its members except as permitted by the Societies Act of British Columbia.",
    },
  ],
} as const;

export const boardContent = {
  title: "Our Board",
  photoAlt:
    "CCVAA board members Zhong Liu, Yaqi Jing, and Albert Zang",
  photoPlaceholderNote: "Board photo coming soon.",
  portraitPlaceholderNote: "Portrait coming soon.",
  bioPlaceholder: "Bio coming soon.",
  members: [
    {
      name: "Zhong Liu",
      role: "President",
      portraitAlt: "Portrait of Zhong Liu, President",
    },
    {
      name: "Yaqi Jing",
      role: "Vice President",
      portraitAlt: "Portrait of Yaqi Jing, Vice President",
    },
    {
      name: "Albert Zang",
      role: "Secretary",
      portraitAlt: "Portrait of Albert Zang, Secretary",
    },
  ],
} as const;

export const contactContent = {
  title: "Contact us",
  description:
    "Interested in partnering, volunteering, or learning more about our programs? We would love to hear from you.",
  emailLabel: "Email",
  addressLabel: "Mailing address",
} as const;

export const membershipContent = {
  title: "Membership",
  description:
    "Join CCVAA as a paid member, or sign in with email if you already belong. Newsletter signup stays in Contact.",
  loginTitle: "Member sign-in",
  loginDescription:
    "Enter the email on your membership. We will send a 6-digit code — no password.",
  loginSendLabel: "Send login code",
  loginVerifyLabel: "Sign in",
  loginVerifyHint:
    "Enter the 6-digit code we emailed you to open your membership session.",
  signedInTitle: "Your membership",
  signedInDescription:
    "Update your name or email, view your plan, and sign out. Newsletter preference stays in Contact.",
  signedInAdminNote:
    "This membership session does not grant access to /admin.",
  profileNameLabel: "Display name",
  profileNameSaveLabel: "Save name",
  profileEmailLabel: "Email",
  profileEmailChangeLabel: "Change email",
  profileEmailSendCodeLabel: "Send verification code",
  profileEmailVerifyLabel: "Confirm new email",
  profileEmailVerifyHint:
    "Enter the 6-digit code we sent to your new address.",
  profilePlanLabel: "Plan",
  profileAnniversaryLabel: "Membership anniversary",
  profileNextRenewalLabel: "Next renewal",
  profilePerksTitle: "Member perks",
  profilePerksDescription:
    "Exclusive member benefits will appear here in a future update.",
  logoutLabel: "Sign out",
  joinTitle: "Join CCVAA",
  joinDescription:
    "New members: verify your email, then complete payment with Stripe Checkout. You return here when finished.",
  namePlaceholder: "Your name",
  emailPlaceholder: "you@example.com",
  codePlaceholder: "6-digit code",
  verifyEmailLabel: "Verify email",
  verifyHint:
    "Enter the 6-digit code we emailed you. We will open Stripe Checkout next.",
  checkoutLabel: "Continue to checkout",
  newsletterOptInLabel:
    "Also send me the CCVAA newsletter (optional)",
  consentNote:
    "Paid membership is separate from the newsletter. Change newsletter preference anytime in Contact.",
  joinedSuccess:
    "Thanks for joining. Sign in above with your membership email if you are not signed in automatically.",
  joinedActivating:
    "Payment received — activating your membership and signing you in…",
  joinedSessionTimeout:
    "Membership may still be activating. Sign in above with your email in a moment, or refresh this page.",
} as const;

export const newsletterContent = {
  title: "Newsletter",
  description:
    "Occasional updates about exhibitions, programs, and community news. This mailing list is separate from paid CCVAA membership — you can subscribe or unsubscribe anytime.",
  subscribeLabel: "Subscribe",
  manageLabel: "Manage preference",
  emailPlaceholder: "you@example.com",
  namePlaceholder: "Your name",
  codePlaceholder: "6-digit code",
  consentNote:
    "By subscribing you consent to receive email from CCVAA. You can unsubscribe anytime. This is not a membership plan.",
  pendingNote:
    "Enter the 6-digit code we emailed you. You are not subscribed until you confirm.",
  subscribedNote: "You are subscribed to the CCVAA newsletter.",
  unsubscribedNote: "You are not subscribed to the newsletter.",
  membershipNote:
    "Paid membership is managed separately and is not affected by newsletter changes.",
  unsubLandingSuccess:
    "You have been unsubscribed from the CCVAA newsletter. Your paid membership, if any, is unchanged.",
  unsubLandingAlready:
    "You were already unsubscribed from the newsletter. Your paid membership, if any, is unchanged.",
  unsubLandingInvalid: "This unsubscribe link is invalid or has expired.",
} as const;
