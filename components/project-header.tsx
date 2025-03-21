"use client"

import { ChevronDown, MessageSquare, Zap, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function ProjectHeader({ projectName }: { projectName: string }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">{projectName}</h1>
        <ChevronDown className="h-5 w-5 ml-2 text-gray-500" />
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Integrate
        </Button>

        <Button variant="outline" size="sm" className="flex items-center">
          <Zap className="h-4 w-4 mr-2" />
          Automate
        </Button>

        <div className="flex -space-x-2">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarFallback className="bg-green-500 text-white text-xs">DP</AvatarFallback>
          </Avatar>
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarFallback className="bg-orange-500 text-white text-xs">NM</AvatarFallback>
          </Avatar>
        </div>

        <Button variant="outline" size="sm">
          Invite / 2
        </Button>

        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

