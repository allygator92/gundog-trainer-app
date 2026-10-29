import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearBookingDraft,
  getBookingDraftServerSnapshot,
  getBookingDraftSnapshot,
  parseBookingDraft,
  saveBookingDraft,
} from "@/lib/booking-draft";

const draft = {
  serviceId: "svc",
  startsAt: "2026-10-28T09:00:00.000Z",
  dateLabel: "Wednesday 28 October",
  dateKey: "2026-10-28",
  label: "09:00",
  clientId: "client",
  dogId: "dog",
  ownerName: "Sam",
  dogName: "Moss",
};

describe("parseBookingDraft", () => {
  it("reads a saved booking", () => {
    expect(parseBookingDraft(JSON.stringify(draft))).toEqual(draft);
  });

  it("ignores a partial or broken save", () => {
    expect(parseBookingDraft(null)).toBeNull();
    expect(parseBookingDraft("{")).toBeNull();
    expect(parseBookingDraft(JSON.stringify({ serviceId: "svc" }))).toBeNull();
  });
});

describe("booking draft snapshot", () => {
  afterEach(() => {
    clearBookingDraft();
    vi.unstubAllGlobals();
  });

  it("stays pending on the server and empty until a draft is saved", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });

    expect(getBookingDraftServerSnapshot()).toEqual({ status: "pending" });
    expect(getBookingDraftSnapshot()).toEqual({ status: "empty" });

    saveBookingDraft(draft);
    expect(getBookingDraftSnapshot()).toEqual({ status: "ready", draft });

    clearBookingDraft();
    expect(getBookingDraftSnapshot()).toEqual({ status: "empty" });
  });

  it("treats blocked storage as no draft", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    });

    expect(getBookingDraftSnapshot()).toEqual({ status: "empty" });
    expect(() => saveBookingDraft(draft)).not.toThrow();
    expect(() => clearBookingDraft()).not.toThrow();
  });
});
