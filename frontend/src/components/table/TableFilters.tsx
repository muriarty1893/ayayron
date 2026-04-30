import { MultiSelect, MultiSelectItem, TextInput, Select, SelectItem } from "@tremor/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { STATUS_ORDER, STATUS_LABELS } from "../../constants/statuses";
import type { ListFilter, Status } from "../../types/application";

interface TableFiltersProps {
  filter: ListFilter;
  onChange: (f: ListFilter) => void;
}

export function TableFilters({ filter, onChange }: TableFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <TextInput
        className="w-64"
        placeholder="Search company, position..."
        icon={MagnifyingGlassIcon}
        value={filter.search}
        onValueChange={(v) => onChange({ ...filter, search: v })}
      />
      <MultiSelect
        className="w-56"
        placeholder="Filter by status"
        value={filter.statuses}
        onValueChange={(v) => onChange({ ...filter, statuses: v as Status[] })}
      >
        {STATUS_ORDER.map((s) => (
          <MultiSelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </MultiSelectItem>
        ))}
      </MultiSelect>
      <Select
        className="w-44"
        value={filter.sortBy}
        onValueChange={(v) => onChange({ ...filter, sortBy: v as ListFilter["sortBy"] })}
      >
        <SelectItem value="appliedDate">Applied Date</SelectItem>
        <SelectItem value="company">Company</SelectItem>
        <SelectItem value="status">Status</SelectItem>
      </Select>
      <Select
        className="w-32"
        value={filter.sortDir}
        onValueChange={(v) => onChange({ ...filter, sortDir: v as "asc" | "desc" })}
      >
        <SelectItem value="desc">Newest</SelectItem>
        <SelectItem value="asc">Oldest</SelectItem>
      </Select>
    </div>
  );
}
