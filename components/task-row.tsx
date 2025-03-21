"use client"

import type React from "react"

import { ChevronDown, ChevronRight, GripVertical } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface TaskRowProps {
  task: Task
  expanded: boolean
  onToggle: () => void
  borderColor: string
  onDragStart: (e: React.DragEvent) => void
  groupId: string
}

export default function TaskRow({ task, expanded, onToggle, borderColor, onDragStart, groupId }: TaskRowProps) {
  const [isDragging, setIsDragging] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-blue-500"
      case "low":
        return "bg-yellow-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "done":
        return "bg-green-500"
      case "open":
        return "bg-pink-500"
      case "not started":
        return "bg-gray-300"
      default:
        return "bg-gray-300"
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(e)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={cn(
        "grid grid-cols-12 border-b hover:bg-gray-50 group",
        task.subtasks && task.subtasks.length > 0 ? "cursor-pointer" : "",
        isDragging && "opacity-50 bg-gray-100",
        expanded && "bg-gray-50",
      )}
      style={{ borderLeft: expanded ? `2px solid ${borderColor}` : "none" }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-task-id={task.id}
      data-group-id={groupId}
    >
      <div className="col-span-4 p-2 flex items-center">
        <input type="checkbox" className="mr-2" />

        <div
          className="cursor-grab p-1 mr-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded"
          onMouseDown={(e) => {
            // Prevent toggling when starting drag
            e.stopPropagation()
          }}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {task.subtasks && task.subtasks.length > 0 ? (
          <button onClick={onToggle} className="mr-1">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-5"></div>
        )}

        <span className="text-sm">{task.name}</span>

        {task.count && <span className="ml-2 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{task.count}</span>}
      </div>

      <div className="col-span-1 p-2">
        {task.owner ? (
          <Avatar className="h-6 w-6">
            <AvatarFallback
              className={cn("text-white text-xs", task.owner === "DP" ? "bg-green-500" : "bg-orange-500")}
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

      <div className="col-span-1 p-2">
        {task.priority && (
          <div className={cn("text-xs text-white py-1 px-2 rounded text-center", getPriorityColor(task.priority))}>
            {task.priority}
          </div>
        )}
      </div>

      <div className="col-span-1 p-2">
        {task.status && (
          <div className={cn("text-xs text-white py-1 px-2 rounded text-center", getStatusColor(task.status))}>
            {task.status}
          </div>
        )}
      </div>

      <div className="col-span-1 p-2">
        {task.startDate && (
          <div
            className={cn(
              "text-xs py-1 px-2 rounded text-center",
              task.startDate.includes("Mar 3") ? "bg-blue-500 text-white" : "",
            )}
          >
            {task.startDate}
          </div>
        )}
      </div>

      <div className="col-span-1 p-2">{task.notes}</div>

      <div className="col-span-1 p-2">
        {task.budget && (
          <div className="text-xs">
            ${task.budget}
            <div className="text-gray-400">sum</div>
          </div>
        )}
      </div>

      <div className="col-span-1 p-2">
        {task.files && (
          <div className="text-xs">
            {task.files}
            <div className="text-gray-400">files</div>
          </div>
        )}
      </div>

      <div className="col-span-1 p-2">
        {task.timeline && (
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gray-400 rounded-full" style={{ width: "60%" }}></div>
          </div>
        )}
      </div>
    </div>
  )
}

