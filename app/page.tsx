import ProjectDashboard from "@/components/project-dashboard"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectDashboard />
      <Toaster />
    </div>
  )
}

