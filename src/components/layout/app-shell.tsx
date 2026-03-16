type AppShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Budget Plan Pro
            </p>
          </div>

          <div className="text-sm text-neutral-500">App Shell</div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            {title}
          </h1>

          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              {description}
            </p>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}