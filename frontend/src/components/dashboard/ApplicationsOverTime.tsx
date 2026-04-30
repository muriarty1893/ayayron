import { useState } from "react";
import { Card, Title, AreaChart, TabGroup, TabList, Tab } from "@tremor/react";
import { useApplicationsOverTime } from "../../hooks/useDashboardStats";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export function ApplicationsOverTime() {
  const [rangeIdx, setRangeIdx] = useState(1);
  const { data = [] } = useApplicationsOverTime(RANGES[rangeIdx].days);

  const chartData = data.map((p) => ({ date: p.date, Applications: Number(p.count) }));

  return (
    <Card>
      <div className="flex items-center justify-between">
        <Title>Applications Over Time</Title>
        <TabGroup index={rangeIdx} onIndexChange={setRangeIdx}>
          <TabList variant="solid" className="w-fit">
            {RANGES.map((r) => (
              <Tab key={r.label}>{r.label}</Tab>
            ))}
          </TabList>
        </TabGroup>
      </div>
      <AreaChart
        className="mt-4 h-40"
        data={chartData}
        index="date"
        categories={["Applications"]}
        colors={["indigo"]}
        valueFormatter={(v) => `${v}`}
        showLegend={false}
        showYAxis={false}
        curveType="monotone"
      />
    </Card>
  );
}
