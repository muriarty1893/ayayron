import { useInstallationHistory } from "../hooks/useTools";
import { HistoryList } from "../components/history/HistoryList";
import { EmptyState } from "../components/ui/EmptyState";

export function HistoryPage() {
  const { data: records = [], isLoading } = useInstallationHistory(100);

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading…</div>;
  }

  if (records.length === 0) {
    return (
      <EmptyState
        title="No installation history"
        description="Complete a setup wizard to see history here."
      />
    );
  }

  return <HistoryList records={records} />;
}
