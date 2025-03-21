"use client"

import { ChevronDown, Search, User, Filter, ArrowUpDown, Eye, Grid3X3, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TaskToolbar() {
  return (
    <div className="flex items-center p-2 gap-2">
      <Button variant="outline" size="sm" className="flex items-center gap-1">
        New task
        <ChevronDown className="h-4 w-4" />
      </Button>

      <div className="flex items-center bg-white border rounded-md px-2 py-1">
        <Search className="h-4 w-4 text-gray-500" />
        <input type="text" placeholder="Search" className="text-sm border-none focus:outline-none px-2 py-1 w-24" />
      </div>

      <Button variant="outline" size="sm" className="flex items-center gap-1">
        <User className="h-4 w-4" />
        Person
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1">
        <Filter className="h-4 w-4" />
        Filter
        <ChevronDown className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1">
        <ArrowUpDown className="h-4 w-4" />
        Sort
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        Hide
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1">
        <Grid3X3 className="h-4 w-4" />
        Group by
      </Button>

      <Button variant="ghost" size="icon" className="ml-auto">
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  )
}

