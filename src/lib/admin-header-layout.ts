/**
 * Admin header layout classes.
 * Phone: brand + Heath/Field on the first row; Support / View site / Sign out wrap below.
 * Tablet and web: brand, actions, then the toggle on the far right — same as the public header.
 */
export const adminHeaderLayout = {
  bar: "flex flex-wrap items-center justify-between gap-x-3 gap-y-3",
  brand: "flex min-w-0 flex-1 items-center gap-2 sm:gap-3",
  toggle: "order-2 shrink-0 sm:order-3",
  actions:
    "admin-header-actions order-3 flex w-full min-w-0 flex-wrap items-center gap-2 sm:order-2 sm:w-auto sm:flex-1 sm:justify-end",
} as const;
