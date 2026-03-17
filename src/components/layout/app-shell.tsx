import Link from "next/link";

type AppShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/bills", label: "Bills" },
];

export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Budget Plan Pro
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-neutral-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
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