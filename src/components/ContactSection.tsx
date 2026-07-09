import { contactContent, organization } from "@/lib/site";

export function ContactSection() {
  const { address } = organization;

  return (
    <section id="contact" className="scroll-mt-24 bg-ocean-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-ocean-100 bg-white p-8 text-center shadow-sm sm:p-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ocean-900">
            {contactContent.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ocean-600">
            {contactContent.description}
          </p>

          <div className="mt-8">
            <p className="text-sm font-medium uppercase tracking-wider text-ocean-500">
              {contactContent.emailLabel}
            </p>
            <a
              href={`mailto:${organization.email}`}
              className="mt-2 inline-block font-display text-xl font-semibold text-ocean-800 transition-colors hover:text-coral"
            >
              {organization.email}
            </a>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium uppercase tracking-wider text-ocean-500">
              {contactContent.addressLabel}
            </p>
            <address className="mt-2 text-sm not-italic leading-relaxed text-ocean-700">
              {organization.legalName}
              <br />
              {address.line1}
              <br />
              {address.city}, {address.province} {address.postalCode}
              <br />
              {address.country}
            </address>
          </div>
        </div>
      </div>
    </section>
  );
}
