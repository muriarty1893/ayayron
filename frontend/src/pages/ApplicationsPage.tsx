import { useState } from "react";
import { TableFilters } from "../components/table/TableFilters";
import { ApplicationsTable } from "../components/table/ApplicationsTable";
import { useApplications } from "../hooks/useApplications";
import type { ListFilter } from "../types/application";

const DEFAULT_FILTER: ListFilter = {
  search: "",
  statuses: [],
  sortBy: "appliedDate",
  sortDir: "desc",
};

export function ApplicationsPage() {
  const [filter, setFilter] = useState<ListFilter>(DEFAULT_FILTER);
  const { data: applications = [], isLoading } = useApplications(filter);

  return (
    <div className="space-y-4">
      <TableFilters filter={filter} onChange={setFilter} />
      {isLoading ? (
        <div className="py-12 text-center text-gray-500 text-sm">Loading...</div>
      ) : (
        <ApplicationsTable applications={applications} />
      )}
    </div>
  );
}
