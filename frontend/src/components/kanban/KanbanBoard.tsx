import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCardOverlay } from "./KanbanCardOverlay";
import { ApplicationForm } from "../forms/ApplicationForm";
import { useUpdateStatus } from "../../hooks/useApplications";
import { STATUS_ORDER } from "../../constants/statuses";
import type { JobApplication, Status } from "../../types/application";

interface KanbanBoardProps {
  applications: JobApplication[];
}

export function KanbanBoard({ applications }: KanbanBoardProps) {
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const updateStatus = useUpdateStatus();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const byStatus = STATUS_ORDER.reduce<Record<Status, JobApplication[]>>(
    (acc, s) => ({ ...acc, [s]: [] }),
    {} as Record<Status, JobApplication[]>
  );
  applications.forEach((app) => {
    if (byStatus[app.status]) byStatus[app.status].push(app);
  });

  function onDragStart(event: DragStartEvent) {
    const app = applications.find((a) => a.id === event.active.id);
    if (app) setActiveApp(app);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;

    const sourceApp = applications.find((a) => a.id === active.id);
    if (!sourceApp) return;

    const targetStatus = (over.data.current?.status ??
      applications.find((a) => a.id === over.id)?.status) as Status | undefined;

    if (targetStatus && targetStatus !== sourceApp.status) {
      updateStatus.mutate({ id: sourceApp.id, status: targetStatus });
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={byStatus[status]}
              onCardClick={setEditingApp}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApp ? <KanbanCardOverlay app={activeApp} /> : null}
        </DragOverlay>
      </DndContext>

      {editingApp && (
        <ApplicationForm
          initial={editingApp}
          onClose={() => setEditingApp(null)}
        />
      )}
    </>
  );
}
