export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-24">
        <div className="w-full max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-green-700">
            Budget Plan Pro
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
            AI-powered household money planning for couples and families
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
            Know what to do with your money before you spend it.
          </p>

          <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-left shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">
              Foundation build complete
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Your Next.js app is running. Next, we will connect Supabase,
              create authentication, and start building the real application
              shell.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
