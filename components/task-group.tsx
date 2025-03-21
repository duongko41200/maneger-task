"use client";

import type React from "react";

import { useState, useRef } from "react";
import { ChevronDown, ChevronRight, Info, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import SubtaskRow from "./subtask-row";
import type { Task } from "@/lib/types";
import type { Subtask } from "@/lib/types";

interface TaskGroupProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onAddTask: (groupId: string) => void;
  addSubtask: any;
  onDragStart: (
    e: React.DragEvent,
    type: string,
    id: string,
    sourceGroupId?: string
  ) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetGroupId: string) => void;
  index: number;
  renderTaskRow: (
    task: Task,
    expanded: boolean,
    onToggle: () => void
  ) => React.ReactNode;
  onOpenSubtaskSidebar?: (subtask: Subtask, parentTask: Task) => void;
  onAddSubtask: (parentTaskId: string) => void;
}

export default function TaskGroup({
  id,
  title,
  color,
  tasks,
  onAddTask,
  onDragStart,
  onDragOver,
  onDrop,
  index,
  addSubtask,
  renderTaskRow,
  onOpenSubtaskSidebar,
  onAddSubtask,
}: TaskGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>(
    {}
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);

  const toggleGroup = () => {
    setExpanded(!expanded);
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver(e);
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    onDrop(e, id);
  };

  return (
    <div
      ref={groupRef}
      className={cn(
        "mb-4 transition-all duration-200 task-group-drop-target",
        isDraggingOver && "drag-over"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, "group", id)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-group-id={id}
      data-index={index}
    >
      <div className="flex items-center py-2 cursor-pointer group">
        <div
          className="cursor-grab p-1 mr-1 hover:bg-gray-100 rounded"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>

        <div onClick={toggleGroup} className="flex items-center flex-1">
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
          )}
          <span className="text-sm font-medium" style={{ color: color }}>
            {title}
          </span>
        </div>
      </div>

      {expanded && (
        <div
          className={cn(
            "border rounded-md overflow-hidden",
            isDraggingOver && "drag-over"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="grid grid-cols-12 bg-gray-50 border-b text-sm font-medium text-gray-600">
            <div className="col-span-4 p-2 flex items-center">Task</div>
            <div className="col-span-1 p-2">Owner</div>
            <div className="col-span-1 p-2">Priority</div>
            <div className="col-span-1 p-2 flex items-center">
              Status
              <Info className="h-4 w-4 ml-1 text-gray-400" />
            </div>
            <div className="col-span-1 p-2 flex items-center">
              ngày bắt đầu
              <Info className="h-4 w-4 ml-1 text-gray-400" />
            </div>
            <div className="col-span-1 p-2">Notes</div>
            <div className="col-span-1 p-2">Budget</div>
            <div className="col-span-1 p-2">Files</div>
            <div className="col-span-1 p-2 flex items-center">Actions</div>
          </div>

          <div className={cn("task-list", isDraggingOver && "drag-over")}>
            {tasks.map((task) => (
              <div key={task.id}>
                {renderTaskRow(task, !!expandedTasks[task.id], () =>
                  toggleTask(task.id)
                )}

                {expandedTasks[task.id] &&
                  task.subtasks &&
                  task.subtasks.map((subtask) => (
                    <SubtaskRow
                      key={subtask.id}
                      subtask={subtask}
                      borderColor={color}
                      onOpenSidebar={() =>
                        onOpenSubtaskSidebar &&
                        onOpenSubtaskSidebar(subtask, task)
                      }
                    />
                  ))}

                {expandedTasks[task.id] && (
                  <div
                    className="pl-10 border-l-2 ml-6"
                    style={{ borderColor: color }}
                  >
                    <div
                      className="flex items-center p-2 text-gray-400 text-sm hover:bg-gray-50 hover:text-black cursor-pointer"
                      onClick={() => onAddSubtask(task.id)}
                    >
                      + Add subtask
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div
              className="flex items-center p-2 text-gray-400 text-sm hover:bg-gray-50 cursor-pointer"
              onClick={() => onAddTask(title)}
            >
              + Add task
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
