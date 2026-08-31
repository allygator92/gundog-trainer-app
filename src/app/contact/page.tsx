import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <p className="mt-3 text-muted-foreground">
        The contact form arrives in Phase 2. This placeholder route is ready for the marketing
        layout.
      </p>
      <Button asChild className="mt-6 w-fit">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
