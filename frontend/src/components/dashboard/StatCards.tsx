import { Card, Metric, Text, Flex, BadgeDelta } from "@tremor/react";
import type { DashboardStats } from "../../types/application";

interface StatCardsProps {
  stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: "Total Applications",
      value: stats.total,
      delta: "all time",
      deltaType: "unchanged" as const,
    },
    {
      title: "Active",
      value: stats.active,
      delta: "in pipeline",
      deltaType: "increase" as const,
    },
    {
      title: "Offers",
      value: stats.offers,
      delta: "received",
      deltaType: stats.offers > 0 ? ("moderateIncrease" as const) : ("unchanged" as const),
    },
    {
      title: "Rejected",
      value: stats.rejected,
      delta: "closed",
      deltaType: stats.rejected > 0 ? ("moderateDecrease" as const) : ("unchanged" as const),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} decoration="top" decorationColor="indigo">
          <Flex justifyContent="between" alignItems="start">
            <Text>{card.title}</Text>
            <BadgeDelta deltaType={card.deltaType} size="xs">
              {card.delta}
            </BadgeDelta>
          </Flex>
          <Metric className="mt-2">{card.value}</Metric>
        </Card>
      ))}
    </div>
  );
}
