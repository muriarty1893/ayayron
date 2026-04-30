import { Card, Title, List, ListItem, Text } from "@tremor/react";
import { format } from "date-fns";
import { StatusBadge } from "../ui/StatusBadge";
import type { JobApplication } from "../../types/application";

interface RecentApplicationsProps {
  applications: JobApplication[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <Card>
      <Title>Recent Applications</Title>
      {applications.length === 0 ? (
        <Text className="mt-4 text-center text-gray-500">No applications yet</Text>
      ) : (
        <List className="mt-4">
          {applications.map((app) => (
            <ListItem key={app.id}>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{app.company}</span>
                <span className="text-xs text-gray-400">{app.position}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={app.status} />
                <span className="text-xs text-gray-500">
                  {format(new Date(app.appliedDate), "MMM d")}
                </span>
              </div>
            </ListItem>
          ))}
        </List>
      )}
    </Card>
  );
}
