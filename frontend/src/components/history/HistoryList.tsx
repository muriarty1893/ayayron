import { formatDistanceToNow } from "date-fns";
import type { Installation } from "../../types/tool";

const STATUS_COLORS = {
  installed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  skipped: "border-slate-200 bg-slate-100 text-slate-600",
} as const;

interface HistoryListProps {
  records: Installation[];
}

export function HistoryList({ records }: HistoryListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Tool
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Duration
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((rec) => (
            <tr key={rec.id} className="transition-colors hover:bg-teal-50/40">
              <td className="px-4 py-3 text-sm font-semibold text-slate-950">{rec.toolName}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                    STATUS_COLORS[rec.status] ?? STATUS_COLORS.skipped
                  }`}
                >
                  {rec.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {rec.durationMs > 0 ? `${(rec.durationMs / 1000).toFixed(1)}s` : "-"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {formatDistanceToNow(new Date(rec.createdAt), { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
