export const siteConfig = {
  name: "Coast to Coast Visual Arts Association",
  shortName: "CCVAA",
  tagline: "Connecting communities through visual arts across Canada",
  description:
    "A British Columbia–based non-profit fostering visual arts education, exhibitions, and community engagement from coast to coast.",
  url: "https://ccvaa.org", // Update after domain purchase
  locale: "en-CA",
} as const;

export const organization = {
  legalName: "Coast to Coast Visual Arts Association",
  jurisdiction: "British Columbia, Canada",
  registrationNote:
    "Registered non-profit organization in British Columbia, Canada.",
  founded: "2024", // Placeholder — update with actual year
  email: "info@ccvaa.org", // Placeholder — update with real contact
  location: "British Columbia, Canada",
} as const;

export const navigation = [
  { label: "About", href: "#about" },
  { label: "Mission", href: "#mission" },
  { label: "Contact", href: "#contact" },
] as const;

export const heroContent = {
  eyebrow: "Non-profit · British Columbia, Canada",
  headline: "Celebrating visual arts from coast to coast",
  subheadline:
    "We bring artists, educators, and communities together to create, learn, and share the power of visual expression.",
  primaryCta: { label: "Learn about us", href: "#about" },
  secondaryCta: { label: "Get in touch", href: "#contact" },
} as const;

export const aboutContent = {
  title: "About CCVAA",
  paragraphs: [
    "Coast to Coast Visual Arts Association (CCVAA) is a non-profit organization based in British Columbia, dedicated to advancing visual arts across Canada.",
    "We support emerging and established artists through exhibitions, workshops, and community programs that make art accessible to everyone.",
    "Whether you are an artist, educator, volunteer, or art enthusiast, we invite you to join our growing community.",
  ],
  highlights: [
    {
      title: "Community programs",
      description:
        "Workshops, exhibitions, and outreach that connect artists with local communities.",
    },
    {
      title: "Artist support",
      description:
        "Resources and opportunities for visual artists at every stage of their journey.",
    },
    {
      title: "Coast to coast",
      description:
        "Building bridges between artistic communities across Canada.",
    },
  ],
} as const;

export const missionContent = {
  title: "Our mission",
  statement:
    "To enrich lives and strengthen communities by promoting visual arts education, fostering artistic excellence, and making art accessible to all.",
  values: [
    {
      title: "Accessibility",
      description: "Art belongs to everyone, regardless of background or experience.",
    },
    {
      title: "Community",
      description: "We grow stronger when we create and learn together.",
    },
    {
      title: "Excellence",
      description: "We celebrate quality, creativity, and diverse artistic voices.",
    },
    {
      title: "Inclusion",
      description: "We welcome all perspectives and traditions in visual arts.",
    },
  ],
} as const;

export const contactContent = {
  title: "Contact us",
  description:
    "Interested in partnering, volunteering, or learning more about our programs? We would love to hear from you.",
  emailLabel: "Email",
} as const;
