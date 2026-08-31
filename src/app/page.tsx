import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-primary">
            Gundog Trainer
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/book" className="text-muted-foreground hover:text-foreground">
              Book
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Professional gundog training
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Build confidence, recall, and field skills
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Virtual and in-person sessions tailored to working breeds. Book online, complete your
            dog&apos;s intake form, and pay securely.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/book">Book a session</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        Gundog Trainer MVP — Phase 0 scaffold
      </footer>
    </div>
  );
}
