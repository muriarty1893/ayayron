import { Badge, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react";
import { formatDistanceToNow } from "date-fns";
import type { Installation } from "../../types/tool";

const STATUS_COLORS = {
  installed: "emerald",
  failed: "red",
  skipped: "gray",
} as const;

interface HistoryListProps {
  records: Installation[];
}

export function HistoryList({ records }: HistoryListProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Tool</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Duration</TableHeaderCell>
          <TableHeaderCell>Date</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {records.map((rec) => (
          <TableRow key={rec.id}>
            <TableCell className="font-medium text-white">{rec.toolName}</TableCell>
            <TableCell>
              <Badge color={STATUS_COLORS[rec.status] ?? "gray"} size="xs">
                {rec.status}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-400">
              {rec.durationMs > 0 ? `${(rec.durationMs / 1000).toFixed(1)}s` : "—"}
            </TableCell>
            <TableCell className="text-gray-400">
              {formatDistanceToNow(new Date(rec.createdAt), { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
