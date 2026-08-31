import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Book a session</h1>
      <p className="mt-3 text-muted-foreground">
        The full booking flow arrives in Phase 3. For now, this route confirms the app scaffold is
        wired correctly.
      </p>
      <Button asChild className="mt-6 w-fit">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
