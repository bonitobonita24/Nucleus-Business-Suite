import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Nucleus Business Suite
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Powerbyte ERP — Multi-tenant enterprise resource planning for IT
          services businesses.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-input bg-background px-6 py-2 text-foreground hover:bg-accent"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </main>
  );
}
