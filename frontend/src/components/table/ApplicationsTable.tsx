import { useState, useRef, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
} from "@tremor/react";
import { TrashIcon, ArrowTopRightOnSquareIcon, PencilIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { StatusBadge } from "../ui/StatusBadge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ApplicationForm } from "../forms/ApplicationForm";
import { EmptyState } from "../ui/EmptyState";
import { useDeleteApplication, useUpdateStatus } from "../../hooks/useApplications";
import { STATUS_ORDER, STATUS_LABELS, STATUS_BADGE_COLORS } from "../../constants/statuses";
import type { JobApplication, Status } from "../../types/application";

const BADGE_BG: Record<string, string> = {
  blue:    "hover:bg-blue-500/20 hover:text-blue-300",
  indigo:  "hover:bg-indigo-500/20 hover:text-indigo-300",
  violet:  "hover:bg-violet-500/20 hover:text-violet-300",
  purple:  "hover:bg-purple-500/20 hover:text-purple-300",
  emerald: "hover:bg-emerald-500/20 hover:text-emerald-300",
  red:     "hover:bg-red-500/20 hover:text-red-300",
  gray:    "hover:bg-gray-500/20 hover:text-gray-300",
};

function StatusDropdown({ app }: { app: JobApplication }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const updateStatus = useUpdateStatus();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        title="Change status"
      >
        <StatusBadge status={app.status} />
        <ChevronDownIcon className="w-3 h-3 ml-0.5" />
      </button>

      {open && (
        <div className="absolute z-50 right-0 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-1 overflow-hidden">
          {STATUS_ORDER.map((s) => {
            const isCurrent = s === app.status;
            const color = BADGE_BG[STATUS_BADGE_COLORS[s]] ?? BADGE_BG.gray;
            return (
              <button
                key={s}
                disabled={isCurrent || updateStatus.isPending}
                onClick={async () => {
                  await updateStatus.mutateAsync({ id: app.id, status: s });
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  isCurrent
                    ? "text-gray-500 cursor-default bg-gray-800/50"
                    : `text-gray-300 ${color} cursor-pointer`
                }`}
              >
                {isCurrent && <span className="mr-1.5">✓</span>}
                {STATUS_LABELS[s as Status]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ApplicationsTableProps {
  applications: JobApplication[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [deleting, setDeleting] = useState<JobApplication | null>(null);
  const deleteMutation = useDeleteApplication();

  if (applications.length === 0) {
    return <EmptyState message="No applications match your filters" />;
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Company</TableHeaderCell>
            <TableHeaderCell>Position</TableHeaderCell>
            <TableHeaderCell>Location</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Applied</TableHeaderCell>
            <TableHeaderCell>Salary</TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => (
            <TableRow
              key={app.id}
              className="cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => setEditing(app)}
            >
              <TableCell>
                <Text className="font-medium text-white">{app.company}</Text>
              </TableCell>
              <TableCell>
                <Text>{app.position}</Text>
              </TableCell>
              <TableCell>
                <Text className="text-gray-400">{app.location || "—"}</Text>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <StatusDropdown app={app} />
              </TableCell>
              <TableCell>
                <Text className="text-gray-400">
                  {format(new Date(app.appliedDate), "MMM d, yyyy")}
                </Text>
              </TableCell>
              <TableCell>
                <Text className="text-gray-400">
                  {app.salaryMin && app.salaryMax
                    ? `$${(app.salaryMin / 1000).toFixed(0)}k–$${(app.salaryMax / 1000).toFixed(0)}k`
                    : "—"}
                </Text>
              </TableCell>
              <TableCell>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {app.jobUrl && (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setEditing(app)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(app)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editing && (
        <ApplicationForm initial={editing} onClose={() => setEditing(null)} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Application"
          message={`Delete application to ${deleting.company} for ${deleting.position}?`}
          isLoading={deleteMutation.isPending}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deleting.id);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
