"use client";

import { usePathname } from "next/navigation";
import { DemoCallout } from "@/components/demo/demo-callout";
import { adminDemoNoteForPath } from "@/lib/demo";

export function AdminDemoNotes() {
  const pathname = usePathname();
  const note = adminDemoNoteForPath(pathname);

  return (
    <DemoCallout title={note.title}>
      <p>{note.body}</p>
      {note.untilLive ? <p>{note.untilLive}</p> : null}
    </DemoCallout>
  );
}
