import type { Status } from "../types/application";

export const STATUS_ORDER: Status[] = [
  "applied",
  "phone_screen",
  "technical_interview",
  "final_interview",
  "offer",
  "rejected",
  "withdrawn",
];

export const STATUS_LABELS: Record<Status, string> = {
  applied: "Applied",
  phone_screen: "Phone Screen",
  technical_interview: "Technical",
  final_interview: "Final Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_COLORS: Record<Status, string> = {
  applied: "blue",
  phone_screen: "indigo",
  technical_interview: "violet",
  final_interview: "purple",
  offer: "emerald",
  rejected: "red",
  withdrawn: "gray",
};

export const STATUS_BADGE_COLORS: Record<
  Status,
  "blue" | "indigo" | "violet" | "purple" | "emerald" | "red" | "gray"
> = {
  applied: "blue",
  phone_screen: "indigo",
  technical_interview: "violet",
  final_interview: "purple",
  offer: "emerald",
  rejected: "red",
  withdrawn: "gray",
};
