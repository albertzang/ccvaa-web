/**
 * Centered API message chip, fixed just under the site header.
 * Same viewport position logged-in and logged-out (header is ~72px; top-20 clears it).
 */
export function NavMessageBanner({ message }: { message: string | null }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-40 flex min-h-5 items-center justify-center px-6"
      aria-live="polite"
    >
      {message ? (
        <p
          className="pointer-events-auto w-fit max-w-full rounded-md bg-coral px-2 py-0.5 text-center text-[10px] font-semibold text-white shadow-sm ring-1 ring-cream/25"
          role="alert"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
