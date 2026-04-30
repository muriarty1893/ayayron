import { StatCards } from "../components/dashboard/StatCards";
import { StatusDonut } from "../components/dashboard/StatusDonut";
import { ApplicationsOverTime } from "../components/dashboard/ApplicationsOverTime";
import { RecentApplications } from "../components/dashboard/RecentApplications";
import { useDashboardStats, useStatusDistribution, useRecentApplications } from "../hooks/useDashboardStats";

export function DashboardPage() {
  const { data: stats } = useDashboardStats();
  const { data: statusDist = [] } = useStatusDistribution();
  const { data: recent = [] } = useRecentApplications(5);

  const defaultStats = stats ?? { total: 0, active: 0, offers: 0, rejected: 0 };

  return (
    <div className="space-y-6">
      <StatCards stats={defaultStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ApplicationsOverTime />
        </div>
        <StatusDonut data={statusDist} />
      </div>

      <RecentApplications applications={recent} />
    </div>
  );
}
