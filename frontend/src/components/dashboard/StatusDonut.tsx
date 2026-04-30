import { Card, Title, DonutChart, Legend } from "@tremor/react";
import { STATUS_LABELS, STATUS_COLORS } from "../../constants/statuses";
import type { StatusCount, Status } from "../../types/application";

interface StatusDonutProps {
  data: StatusCount[];
}

export function StatusDonut({ data }: StatusDonutProps) {
  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status],
    count: Number(d.count),
  }));

  const colors = data.map((d) => STATUS_COLORS[d.status as Status]);

  return (
    <Card>
      <Title>Status Distribution</Title>
      <DonutChart
        className="mt-4 h-40"
        data={chartData}
        category="count"
        index="name"
        colors={colors}
        valueFormatter={(v) => `${v} apps`}
      />
      <Legend
        className="mt-4"
        categories={chartData.map((d) => d.name)}
        colors={colors}
      />
    </Card>
  );
}
