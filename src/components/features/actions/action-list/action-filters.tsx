'use client';

import { LayoutGrid, LayoutList, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useActionFiltersStore } from '@/lib/stores/action-filters-store';
import { ActionPriority, ActionStatus } from '@/lib/types/action';

export function ActionFilters() {
  const filters = useActionFiltersStore();

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={filters.searchQuery}
            onChange={(e) => filters.setFilter('searchQuery', e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => filters.setFilter('status', value as ActionStatus | 'all')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value={ActionStatus.TODO}>To Do</SelectItem>
          <SelectItem value={ActionStatus.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={ActionStatus.DONE}>Done</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={filters.priority}
        onValueChange={(value) => filters.setFilter('priority', value as ActionPriority | 'all')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value={ActionPriority.LOW}>Low</SelectItem>
          <SelectItem value={ActionPriority.MEDIUM}>Medium</SelectItem>
          <SelectItem value={ActionPriority.HIGH}>High</SelectItem>
          <SelectItem value={ActionPriority.URGENT}>Urgent</SelectItem>
        </SelectContent>
      </Select>

      {/* Assignment Filter */}
      <Select
        value={filters.assignment}
        onValueChange={(value) => filters.setFilter('assignment', value as any)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          <SelectItem value="assigned-to-me">Assigned to Me</SelectItem>
          <SelectItem value="created-by-me">Created by Me</SelectItem>
          <SelectItem value="my-teams">My Teams</SelectItem>
        </SelectContent>
      </Select>

      {/* Toggle Filters */}
      <div className="flex gap-2">
        <Button
          variant={filters.showBlockedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => filters.setFilter('showBlockedOnly', !filters.showBlockedOnly)}
        >
          Blocked Only
        </Button>
        <Button
          variant={filters.showLateOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => filters.setFilter('showLateOnly', !filters.showLateOnly)}
        >
          Late Only
        </Button>
      </div>

      {/* View Mode */}
      <div className="flex items-center gap-1 border-l pl-4">
        <Button
          variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => filters.setFilter('viewMode', 'list')}
          title="List View"
        >
          <LayoutList className="h-4 w-4" />
        </Button>
        <Button
          variant={filters.viewMode === 'kanban' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => filters.setFilter('viewMode', 'kanban')}
          title="Kanban View"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>

      {/* Clear Filters */}
      {(filters.searchQuery ||
        filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.assignment !== 'all' ||
        filters.showBlockedOnly ||
        filters.showLateOnly) && (
        <Button variant="ghost" size="sm" onClick={filters.resetFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
