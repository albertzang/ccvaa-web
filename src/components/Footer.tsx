import { organization, siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  const { address } = organization;

  return (
    <footer className="border-t border-ocean-100 bg-ocean-950 text-ocean-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="font-display text-lg font-semibold text-white">
              {siteConfig.name}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ocean-200">
              {siteConfig.tagline}
            </p>
            <p className="mt-4 text-xs text-ocean-400">
              {organization.registrationNote}
            </p>
          </div>

          <div className="text-sm">
            <p className="font-medium text-white">Mailing address</p>
            <address className="mt-1 not-italic leading-relaxed text-ocean-200">
              {address.line1}
              <br />
              {address.city}, {address.province} {address.postalCode}
              <br />
              {address.country}
            </address>
            <p className="mt-4 font-medium text-white">Contact</p>
            <a
              href={`mailto:${organization.email}`}
              className="mt-1 inline-block text-ocean-200 transition-colors hover:text-white"
            >
              {organization.email}
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-ocean-800 pt-6 text-center text-xs text-ocean-400">
          © {year} {organization.legalName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
