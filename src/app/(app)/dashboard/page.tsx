import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      description="Your household money command center will live here."
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Safe to Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
            <p className="mt-2 text-sm text-neutral-500">
              This will become a live planning number.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Next Paycheck</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
            <p className="mt-2 text-sm text-neutral-500">
              Your next income event will appear here.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Bills Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="mt-2 text-sm text-neutral-500">
              Upcoming bills before the next paycheck.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>AI Coach</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              Your weekly guidance and recommendations will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}