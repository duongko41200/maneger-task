"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  X,
  Check,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface EditableTaskRowProps {
  task: Task;
  expanded: boolean;
  onToggle: () => void;
  borderColor: string;
  onDragStart: (e: React.DragEvent) => void;
  groupId: string;
  onUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onOpenSidebar: (task: Task) => void;
}

export default function EditableTaskRow({
  task,
  expanded,
  onToggle,
  borderColor,
  onDragStart,
  groupId,
  onUpdate,
  onDelete,
  onOpenSidebar,
}: EditableTaskRowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset edited task when task changes
    setEditedTask({});
    setIsEditing(false);
  }, [task]);

  useEffect(() => {
    // Handle click outside to cancel editing
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rowRef.current &&
        !rowRef.current.contains(event.target as Node) &&
        isEditing
      ) {
        cancelEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-blue-500";
      case "low":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "bg-green-500";
      case "open":
        return "bg-pink-500";
      case "in progress":
        return "bg-blue-500";
      case "not started":
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  // Update the handleDragStart function to add a class to the dragged element
  const handleDragStart = (e: React.DragEvent) => {
    if (isEditing) return; // Prevent dragging while editing

    setIsDragging(true);
    e.stopPropagation(); // Prevent event from bubbling up

    // Add data to the drag event
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "task",
        id: task.id,
        sourceGroupId: groupId,
        name: task.name,
      })
    );

    onDragStart(e);
  };

  // Add a new function to handle drag over for task rows
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Get the data from the drag event
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    try {
      const dragData = JSON.parse(data);

      // If we're dragging a task over another task, this indicates
      // we're trying to convert a task to a subtask
      if (dragData.type === "task" && dragData.id !== task.id) {
        e.currentTarget.classList.add("bg-blue-50", "border-blue-300");
        e.dataTransfer.dropEffect = "link"; // Use "link" effect to indicate conversion
      }
      // If we're dragging a subtask over a task (not its parent), this indicates
      // we're trying to move a subtask to another parent
      else if (
        dragData.type === "subtask" &&
        dragData.parentTaskId !== task.id
      ) {
        e.currentTarget.classList.add("bg-green-50", "border-green-300");
        e.dataTransfer.dropEffect = "move";
      }
    } catch (error) {
      console.error("Error parsing drag data:", error);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove(
      "bg-blue-50",
      "border-blue-300",
      "bg-green-50",
      "border-green-300"
    );
  };

  // Update the handleDragEnd function to remove the class
  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Remove the visual class
    const element = document.querySelector(`[data-task-id="${task.id}"]`);
    if (element) {
      element.classList.remove("opacity-50", "bg-gray-100", "dragging");
    }
  };

  const startEdit = () => {
    if (isEditing) return;
    setIsEditing(true);
    setEditedTask({});
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedTask({});
  };

  const saveEdit = () => {
    if (Object.keys(editedTask).length > 0) {
      onUpdate(task.id, editedTask);
    }
    setIsEditing(false);
    setEditedTask({});
  };

  const handleUpdate = (field: keyof Task, value: any) => {
    // Convert "unassigned" to empty string for owner field
    if (field === "owner" && value === "unassigned") {
      value = "";
    }

    setEditedTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't open sidebar if clicking on controls or if editing
    if (
      isEditing ||
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("input")
    ) {
      return;
    }

    onOpenSidebar(task);
  };

  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined;

    // Try to parse "Mar 3" format
    const match = dateStr.match(/([A-Za-z]+)\s+(\d+)/);
    if (match) {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthIndex = monthNames.findIndex(
        (m) => m.toLowerCase() === match[1].toLowerCase()
      );
      if (monthIndex !== -1) {
        const day = Number.parseInt(match[2]);
        const date = new Date();
        date.setMonth(monthIndex);
        date.setDate(day);
        return date;
      }
    }

    return undefined;
  };

  return (
    <div
      ref={rowRef}
      className={cn(
        "grid grid-cols-12 border-b hover:bg-gray-50 group task-row",
        task.subtasks && task.subtasks.length > 0 ? "cursor-pointer" : "",
        isDragging && "dragging",
        expanded && "bg-gray-50",
        isEditing && "bg-blue-50/30"
      )}
      style={{ borderLeft: expanded ? `2px solid ${borderColor}` : "none" }}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-task-id={task.id}
      data-group-id={groupId}
      data-task-drop-target={task.id}
      onClick={handleRowClick}
    >
      <div
        className="col-span-4 p-2 flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input type="checkbox" className="mr-2" />

        <div
          className="cursor-grab p-1 mr-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded"
          onMouseDown={(e) => {
            // Prevent toggling when starting drag
            e.stopPropagation();
          }}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {task.subtasks && task.subtasks.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="mr-1"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-5"></div>
        )}

        {isEditing ? (
          <input
            type="text"
            value={editedTask.name !== undefined ? editedTask.name : task.name}
            onChange={(e) => handleUpdate("name", e.target.value)}
            className="text-sm border rounded px-2 py-1 w-full"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm">{task.name}</span>
        )}

        {task.count && !isEditing && (
          <span className="ml-2 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
            {task.count}
          </span>
        )}
      </div>

      <div className="col-span-1 p-2" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <Select
            value={
              editedTask.owner !== undefined
                ? editedTask.owner || "unassigned"
                : task.owner || "unassigned"
            }
            onValueChange={(value) => handleUpdate("owner", value)}
          >
            <SelectTrigger className="h-7 w-full">
              <SelectValue placeholder="Assign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="DP">DP</SelectItem>
              <SelectItem value="NM">NM</SelectItem>
            </SelectContent>
          </Select>
        ) : task.owner ? (
          <Avatar className="h-6 w-6">
            <AvatarFallback
              className={cn(
                "text-white text-xs",
                task.owner === "DP" ? "bg-green-500" : "bg-orange-500"
              )}
            >
              {task.owner}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-300 text-xs">+</span>
          </div>
        )}
      </div>

      <div className="col-span-1 p-2" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <Select
            value={
              editedTask.priority !== undefined
                ? editedTask.priority
                : task.priority || ""
            }
            onValueChange={(value) => handleUpdate("priority", value)}
          >
            <SelectTrigger className="h-7 w-full">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          task.priority && (
            <div
              className={cn(
                "text-xs text-white py-1 px-2 rounded text-center",
                getPriorityColor(task.priority)
              )}
            >
              {task.priority}
            </div>
          )
        )}
      </div>

      <div className="col-span-1 p-2" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <Select
            value={
              editedTask.status !== undefined
                ? editedTask.status
                : task.status || ""
            }
            onValueChange={(value) => handleUpdate("status", value)}
          >
            <SelectTrigger className="h-7 w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          task.status && (
            <div
              className={cn(
                "text-xs text-white py-1 px-2 rounded text-center",
                getStatusColor(task.status)
              )}
            >
              {task.status}
            </div>
          )
        )}
      </div>

      <div className="col-span-1 p-2" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-full flex justify-between items-center"
              >
                {editedTask.startDate !== undefined
                  ? typeof editedTask.startDate === "string"
                    ? editedTask.startDate
                    : format(editedTask.startDate as Date, "MMM d")
                  : task.startDate || (
                      <span className="text-gray-400">Date</span>
                    )}
                <Calendar className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={
                  typeof editedTask.startDate === "object"
                    ? (editedTask.startDate as Date)
                    : parseDate(task.startDate)
                }
                onSelect={(date) =>
                  handleUpdate("startDate", date ? format(date, "MMM d") : "")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ) : (
          task.startDate && (
            <div
              className={cn(
                "text-xs py-1 px-2 rounded text-center",
                task.startDate.includes("Mar 3") ? "bg-blue-500 text-white" : ""
              )}
            >
              {task.startDate}
            </div>
          )
        )}
      </div>

      <div className="col-span-1 p-2" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input
            type="text"
            value={
              editedTask.notes !== undefined
                ? editedTask.notes
                : task.notes || ""
            }
            onChange={(e) => handleUpdate("notes", e.target.value)}
            className="text-sm border rounded px-2 py-1 w-full h-7"
            placeholder="Notes"
          />
        ) : (
          task.notes
        )}
      </div>

      <div className="col-span-1 p-2" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input
            type="text"
            value={
              editedTask.budget !== undefined
                ? editedTask.budget
                : task.budget || ""
            }
            onChange={(e) => handleUpdate("budget", e.target.value)}
            className="text-sm border rounded px-2 py-1 w-full h-7"
            placeholder="Budget"
          />
        ) : (
          task.budget && (
            <div className="text-xs">
              ${task.budget}
              <div className="text-gray-400">sum</div>
            </div>
          )
        )}
      </div>

      <div className="col-span-1 p-2" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input
            type="text"
            value={
              editedTask.files !== undefined
                ? editedTask.files
                : task.files || ""
            }
            onChange={(e) => handleUpdate("files", e.target.value)}
            className="text-sm border rounded px-2 py-1 w-full h-7"
            placeholder="Files"
          />
        ) : (
          task.files && (
            <div className="text-xs">
              {task.files}
              <div className="text-gray-400">files</div>
            </div>
          )
        )}
      </div>

      <div
        className="col-span-1 p-2 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isEditing ? (
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-green-500 hover:text-green-700 hover:bg-green-100"
              onClick={(e) => {
                e.stopPropagation();
                saveEdit();
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                startEdit();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pencil"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
