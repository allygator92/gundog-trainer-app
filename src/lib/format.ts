export function formatPricePence(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

export function formatDuration(minutes: number): string {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${minutes} minutes`;
}

export function formatServiceType(type: "virtual" | "in_person"): string {
  return type === "virtual" ? "Virtual" : "In person";
}

export function formatBookingStatus(status: "pending_payment" | "confirmed" | "cancelled"): string {
  if (status === "pending_payment") {
    return "Pending payment";
  }
  if (status === "confirmed") {
    return "Confirmed";
  }
  return "Cancelled";
}

export function formatDocumentType(type: "intake_pdf" | "record"): string {
  return type === "intake_pdf" ? "Intake PDF" : "Record";
}
