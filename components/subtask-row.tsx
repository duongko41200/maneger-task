"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Subtask } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SubtaskRowProps {
  subtask: Subtask
  borderColor: string
  onOpenSidebar?: () => void
}

export default function SubtaskRow({ subtask, borderColor, onOpenSidebar }: SubtaskRowProps) {
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
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div
      className="grid grid-cols-12 border-b hover:bg-gray-50 pl-10 cursor-pointer"
      style={{ borderLeft: `2px solid ${borderColor}` }}
      onClick={() => onOpenSidebar && onOpenSidebar()}
    >
      <div className="col-span-4 p-2 flex items-center">
        <input type="checkbox" className="mr-2" onClick={(e) => e.stopPropagation()} />
        <span className="text-sm">{subtask.name}</span>
      </div>

      <div className="col-span-1 p-2">
        {subtask.priority && (
          <div className={cn("text-xs text-white py-1 px-2 rounded text-center", getPriorityColor(subtask.priority))}>
            {subtask.priority}
          </div>
        )}
      </div>

      <div className="col-span-1 p-2">
        {subtask.status && (
          <div className={cn("text-xs text-white py-1 px-2 rounded text-center", getStatusColor(subtask.status))}>
            {subtask.status}
          </div>
        )}
      </div>

      <div className="col-span-1 p-2">{subtask.startDate && <div className="text-xs">{subtask.startDate}</div>}</div>

      <div className="col-span-1 p-2">{subtask.endDate && <div className="text-xs">{subtask.endDate}</div>}</div>

      <div className="col-span-1 p-2">
        {subtask.owner && (
          <div className="flex -space-x-2">
            {subtask.owner.split(",").map((owner, index) => (
              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className={cn("text-white text-xs", owner === "NM" ? "bg-orange-500" : "bg-green-500")}>
                  {owner}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

