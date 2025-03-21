"use client"

import { useState } from "react"
import { Home, Briefcase, MoreHorizontal, Star, Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const [expandedSections, setExpandedSections] = useState({
    favorites: true,
    workspaces: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="w-[200px] bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-2 space-y-2">
        <div className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          <Home className="h-5 w-5 mr-3 text-gray-600" />
          <span className="text-sm font-medium">Home</span>
        </div>
        <div className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          <Briefcase className="h-5 w-5 mr-3 text-gray-600" />
          <span className="text-sm font-medium">My work</span>
        </div>
        <div className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          <MoreHorizontal className="h-5 w-5 mr-3 text-gray-600" />
          <span className="text-sm font-medium">More</span>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-auto">
        <div className="mb-2">
          <div
            className="flex items-center justify-between p-2 cursor-pointer"
            onClick={() => toggleSection("favorites")}
          >
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-3 text-gray-600" />
              <span className="text-sm font-medium">Favorites</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-500 transition-transform",
                expandedSections.favorites ? "" : "-rotate-90",
              )}
            />
          </div>
          {expandedSections.favorites && <div className="pl-10 pr-2 py-1">{/* Favorite items would go here */}</div>}
        </div>

        <div>
          <div
            className="flex items-center justify-between p-2 cursor-pointer"
            onClick={() => toggleSection("workspaces")}
          >
            <div className="flex items-center">
              <div className="h-5 w-5 mr-3 flex items-center justify-center">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
              <span className="text-sm font-medium">Workspaces</span>
            </div>
            <div className="flex items-center">
              <Search className="h-4 w-4 text-gray-500 mr-1" />
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  expandedSections.workspaces ? "" : "-rotate-90",
                )}
              />
            </div>
          </div>

          {expandedSections.workspaces && (
            <div className="pl-2 pr-2 py-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <div className="h-5 w-5 mr-3 flex items-center justify-center">
                    <div className="h-4 w-4 bg-purple-500 rounded text-white flex items-center justify-center text-xs">
                      M
                    </div>
                  </div>
                  <span className="text-sm font-medium">Main workspace</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>

              <div className="pl-10 pr-2 py-1">
                <div className="p-1 rounded-md hover:bg-blue-100 cursor-pointer bg-blue-50">
                  <span className="text-sm text-blue-600">project Aptis</span>
                </div>
                <div className="p-1 rounded-md hover:bg-gray-100 cursor-pointer">
                  <span className="text-sm">Dashboard and reports</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

