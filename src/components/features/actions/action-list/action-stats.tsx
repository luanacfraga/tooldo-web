'use client';

import { useActions } from '@/lib/hooks/use-actions';
import { ActionStatus } from '@/lib/types/action';

export function ActionStats() {
  const { data: actions = [] } = useActions();

  const todoCount = actions.filter((a) => a.status === ActionStatus.TODO).length;
  const inProgressCount = actions.filter((a) => a.status === ActionStatus.IN_PROGRESS).length;
  const doneCount = actions.filter((a) => a.status === ActionStatus.DONE).length;

  return (
    <div className="flex gap-4 text-sm text-muted-foreground">
      <span>
        <span className="font-medium text-gray-700">{todoCount}</span> To Do
      </span>
      <span>•</span>
      <span>
        <span className="font-medium text-blue-700">{inProgressCount}</span> In Progress
      </span>
      <span>•</span>
      <span>
        <span className="font-medium text-green-700">{doneCount}</span> Done
      </span>
    </div>
  );
}
