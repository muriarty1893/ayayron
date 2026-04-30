export type Status =
  | "applied"
  | "phone_screen"
  | "technical_interview"
  | "final_interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface JobApplication {
  id: number;
  company: string;
  position: string;
  location: string;
  jobUrl: string;
  status: Status;
  appliedDate: string;
  notes: string;
  contactPerson: string;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListFilter {
  search: string;
  statuses: Status[];
  sortBy: "appliedDate" | "company" | "status";
  sortDir: "asc" | "desc";
}

export interface ApplicationInput {
  company: string;
  position: string;
  location: string;
  jobUrl: string;
  status: Status;
  appliedDate: string;
  notes: string;
  contactPerson: string;
  salaryMin: number | null;
  salaryMax: number | null;
}

export interface DashboardStats {
  total: number;
  active: number;
  offers: number;
  rejected: number;
}

export interface StatusCount {
  status: Status;
  count: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}
