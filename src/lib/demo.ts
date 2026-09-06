import { demo } from "@content/demo";

export const DEMO_WELCOME_KEY = "gundog-demo-welcome";

export type DemoNote = {
  title: string;
  body: string;
  untilLive?: string;
  afterPay?: string;
};

const ADMIN_TAB_PREFIXES = [
  ["/admin/bookings", "bookings"],
  ["/admin/clients", "clients"],
  ["/admin/availability", "availability"],
  ["/admin/intakes", "intakes"],
  ["/admin/documents", "documents"],
  ["/admin/enquiries", "enquiries"],
  ["/admin/analytics", "analytics"],
  ["/admin/waitlist", "waitlist"],
  ["/admin/support", "support"],
] as const;

export function isDemoEnabled() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") {
    return false;
  }
  return demo.enabled;
}

export function formatCardNumber(digits: string) {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function adminDemoNoteForPath(pathname: string): DemoNote {
  if (pathname.startsWith("/admin/login")) {
    return demo.login;
  }

  for (const [prefix, key] of ADMIN_TAB_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return demo.adminTabs[key];
    }
  }

  if (pathname === "/admin" || pathname === "/admin/") {
    return demo.adminTabs.overview;
  }

  return demo.admin;
}

export function sampleNotesForPath(pathname: string): DemoNote[] {
  if (pathname.startsWith("/admin")) {
    const tab = adminDemoNoteForPath(pathname);
    if (tab.title === demo.admin.title) {
      return [demo.admin];
    }
    return [tab];
  }

  const payment: DemoNote = {
    title: demo.payment.title,
    body: demo.payment.body,
    afterPay: demo.payment.afterPay,
  };
  const publicNotes: DemoNote[] = [payment, demo.contact, demo.about, demo.admin, demo.cookies];
  if (pathname.startsWith("/cookies")) {
    return [demo.cookies, payment, demo.contact, demo.about, demo.admin];
  }
  return publicNotes;
}
