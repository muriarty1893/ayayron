import { Badge } from "@tremor/react";
import { STATUS_LABELS, STATUS_BADGE_COLORS } from "../../constants/statuses";
import type { Status } from "../../types/application";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge color={STATUS_BADGE_COLORS[status]} size="sm">
      {STATUS_LABELS[status]}
    </Badge>
  );
}
