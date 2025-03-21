"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProjectTabs() {
  const [activeTab, setActiveTab] = useState("Main Table")

  return (
    <div className="flex items-center border-b">
      <div
        className={cn(
          "px-4 py-2 text-sm font-medium cursor-pointer relative",
          activeTab === "Main Table" ? "text-blue-600" : "text-gray-600 hover:text-gray-900",
        )}
        onClick={() => setActiveTab("Main Table")}
      >
        Main Table
        {activeTab === "Main Table" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
      </div>

      <button className="p-2 text-gray-500 hover:text-gray-700">
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}

