import { BriefcaseIcon } from "@heroicons/react/24/outline";

interface EmptyStateProps {
  message?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  message = "No applications yet",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BriefcaseIcon className="w-12 h-12 text-gray-600 mb-4" />
      <p className="text-gray-400 text-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
