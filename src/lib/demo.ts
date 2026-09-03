import { demo } from "@content/demo";

export const DEMO_WELCOME_KEY = "gundog-demo-welcome";

export function isDemoEnabled() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") {
    return false;
  }
  return demo.enabled;
}

export function formatCardNumber(digits: string) {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}
