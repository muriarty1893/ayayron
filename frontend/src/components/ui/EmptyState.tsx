import { InboxIcon } from "@heroicons/react/24/outline";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <InboxIcon className="mb-4 h-12 w-12 text-gray-600" />
      <p className="text-sm font-medium text-gray-300">{title}</p>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
