/** Reserved centered chip in top padding — sits just above page content under the nav. */
export function NavMessageBanner({ message }: { message: string | null }) {
  return (
    <div
      className="absolute inset-x-6 top-20 z-10 flex min-h-5 -translate-y-full items-center justify-center sm:top-24"
      aria-live="polite"
    >
      {message ? (
        <p
          className="w-fit max-w-full rounded-md bg-coral px-2 py-0.5 text-center text-[10px] font-semibold text-white shadow-sm ring-1 ring-cream/25"
          role="alert"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
