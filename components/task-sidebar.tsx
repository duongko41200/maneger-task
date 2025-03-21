"use client"

import { useState, useEffect } from "react"
import { X, Paperclip, Edit, Trash, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Task, Subtask } from "@/lib/types"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import {
  MessageSquare,
  User,
  MoreHorizontal,
  SmilePlus,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";

// Add a formatDate function to format the timestamp
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"

interface TaskSidebarProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onAddContent: (taskId: string, content: string) => void
  onAddSubtask: (taskId: string, subtask: Subtask) => void
  onUpdateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  groupId: string
}

export default function TaskSidebar({
  isOpen,
  task,
  onClose,
  onUpdateTask,
  onAddContent,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  groupId,
}: TaskSidebarProps) {
  const [content, setContent] = useState("")
  const [showAddSubtask, setShowAddSubtask] = useState(false)
  const [newSubtask, setNewSubtask] = useState<Partial<Subtask>>({
    name: "",
    priority: "",
    status: "Not Started",
    startDate: "",
    endDate: "",
    owner: "",
  })

  // Add a new state for tracking which content item is being edited
  const [editingContentIndex, setEditingContentIndex] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState("")

  // Add a function to handle editing content
  const handleEditContent = (index: number) => {
    if (task?.contentList && task.contentList[index]) {
      setEditingContentIndex(index)
      setEditedContent(task.contentList[index].text)
    }
  }

  // Add a function to save edited content
  const handleSaveEditedContent = () => {
    if (task && editingContentIndex !== null && editedContent.trim()) {
      const updatedContentList = [...(task.contentList || [])]

      // Preserve the timestamp and author, only update the text
      updatedContentList[editingContentIndex] = {
        ...updatedContentList[editingContentIndex],
        text: editedContent,
      }

      onUpdateTask(task.id, { contentList: updatedContentList })
      setEditingContentIndex(null)
      setEditedContent("")

      toast({
        title: "Content updated",
        description: "Content has been updated successfully.",
      })
    }
  }

  // Add a function to delete content
  const handleDeleteContent = (index: number) => {
    if (task && task.contentList) {
      const updatedContentList = [...task.contentList]
      updatedContentList.splice(index, 1)

      onUpdateTask(task.id, { contentList: updatedContentList })

      toast({
        title: "Content deleted",
        description: "Content has been deleted successfully.",
      })
    }
  }

  useEffect(() => {
    setContent("")
    setShowAddSubtask(false)
    setEditingContentIndex(null)
    setEditedContent("")
    resetNewSubtask()
  }, [task])

  const resetNewSubtask = () => {
    setNewSubtask({
      name: "",
      priority: "",
      status: "Not Started",
      startDate: "",
      endDate: "",
      owner: "",
    })
  }

  // Update the handleSubmitContent function to include a timestamp with the content
  const handleSubmitContent = () => {
    if (task && content.trim()) {
      // Format the content to include bullet points if it has multiple lines
      let formattedContent = content

      // If content has multiple lines and doesn't already have bullet points,
      // add bullet points to each line
      if (content.includes("\n") && !content.includes("•")) {
        formattedContent = content
          .split("\n")
          .map((line, index) => (line.trim() ? `• ${line.trim()}` : line))
          .join("\n")
      }

      // Create a content entry with timestamp and formatted content
      const timestamp = new Date().toISOString()
      const contentEntry = {
        text: formattedContent,
        timestamp,
        author: task.owner || "DP",
      }

      // Update the task with the new content entry
      const updatedContentList = [...(task.contentList || [])]
      updatedContentList.push(contentEntry)

      onUpdateTask(task.id, { contentList: updatedContentList })
      setContent("")

      toast({
        title: "Content added",
        description: "Your content has been saved successfully.",
      })
    }
  }

  // const handleAddSubtask = () => {
  //   if (task && newSubtask.name) {
  //     const subtask: Subtask = {
  //       id: nanoid(),
  //       ...(newSubtask as Subtask),
  //     }
  //     onAddSubtask(task.id, subtask)
  //     setShowAddSubtask(false)
  //     resetNewSubtask()
  //   }
  // }

  // const handleUpdateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
  //   if (task) {
  //     onUpdateSubtask(task.id, subtaskId, updates)
  //   }
  // }

  // const handleDeleteSubtask = (subtaskId: string) => {
  //   if (task) {
  //     onDeleteSubtask(task.id, subtaskId)
  //   }
  // }

  // const handleSubtaskChange = (field: keyof Subtask, value: any) => {
  //   setNewSubtask((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }))
  // }

  if (!isOpen || !task) return null

  // Add this function to format the date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)

    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`
    } else if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      // Less than a week ago
      return formatDistanceToNow(date, { addSuffix: true })
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-[500px] bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col border-b">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-blue-600">{task.name}</div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {task.owner && (
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarFallback
                    className={cn(
                      "text-white text-xs",
                      task.owner === "DP" ? "bg-green-500" : "bg-orange-500"
                    )}
                  >
                    {task.owner}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="px-4 pb-2">
          <h2 className="text-xl font-semibold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-gray-500"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
            </svg>
            {task.name} {task.startDate ? task.startDate : "4/3/2025"}
          </h2>
        </div>
      </div>

      <Tabs defaultValue="updates" className="flex-1 flex flex-col">
        <TabsList className="px-4 py-2 border-b">
          <TabsTrigger
            value="updates"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
          >
            <div className="flex items-center">
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
                className="mr-2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Updates / 1
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
          >
            <div className="flex items-center">
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
                className="mr-2"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Files
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
          >
            <div className="flex items-center">
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
                className="mr-2"
              >
                <path d="M12 20v-6M6 20V10M18 20V4"></path>
              </svg>
              Activity Log
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="updates"
          className="flex-1 p-0 overflow-auto flex flex-col"
        >
          <div className="flex-1 overflow-auto">
            {task.contentList ? (
              <div className="p-4 space-y-6">
                <TabsContent value="updates" className="mt-0">
                  <div className="p-4">
                    {/* Input field */}
                    <div className="mb-6">
                      <textarea
                        className="w-full border border-gray-200 rounded-md p-3 text-sm"
                        placeholder="Write an update and mention others with @"
                        rows={3}
                      />
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-600 text-white">
                            DP
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">
                              Duong Pham{" "}
                              <span className="text-gray-500 text-sm font-normal">
                                3d
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-1 text-sm">
                            <p>Link app 14/3/2025</p>
                            <p className="text-blue-500">@Nguyễn Minh Anh</p>
                            <p className="mt-2">
                              <a
                                href="https://4c7b1c68.staging-aptis.pages.dev"
                                className="text-blue-500 hover:underline"
                              >
                                https://4c7b1c68.staging-aptis.pages.dev
                              </a>
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Edited
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-gray-500"
                            >
                              Like
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-gray-500"
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Reply input */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-600 text-white">
                          DP
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full border border-gray-200 rounded-md p-3 text-sm"
                          placeholder="Write a reply and mention others with @"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                {task.contentList.map((item, index) => (
                  <div key={index} className="relative group">
                    {editingContentIndex === index ? (
                      <>
                        <TabsContent value="updates" className="mt-0">
                          <div className="p-4">
                            {/* Input field */}
                            <div className="mb-6">
                              <textarea
                                className="w-full border border-gray-200 rounded-md p-3 text-sm"
                                placeholder="Write an update and mention others with @"
                                rows={3}
                              />
                            </div>

                            {/* Comment */}
                            <div className="mb-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-green-600 text-white">
                                    DP
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                      Duong Pham{" "}
                                      <span className="text-gray-500 text-sm font-normal">
                                        3d
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button className="text-gray-400 hover:text-gray-600">
                                        <X className="h-4 w-4" />
                                      </button>
                                      <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-1 text-sm">
                                    <p>Link app 14/3/2025</p>
                                    <p className="text-blue-500">
                                      @Nguyễn Minh Anh
                                    </p>
                                    <p className="mt-2">
                                      <a
                                        href="https://4c7b1c68.staging-aptis.pages.dev"
                                        className="text-blue-500 hover:underline"
                                      >
                                        https://4c7b1c68.staging-aptis.pages.dev
                                      </a>
                                    </p>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-500">
                                    Edited
                                  </div>
                                  <div className="mt-2 flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-gray-500"
                                    >
                                      Like
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-gray-500"
                                    >
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Separator className="my-4" />

                            {/* Reply input */}
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-green-600 text-white">
                                  DP
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  className="w-full border border-gray-200 rounded-md p-3 text-sm"
                                  placeholder="Write a reply and mention others with @"
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <div>
                          <textarea
                            className="w-full border rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={5}
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                          ></textarea>
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingContentIndex(null)}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveEditedContent}>
                              <Check className="h-4 w-4 mr-1" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="flex items-start mb-2">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarFallback
                              className={cn(
                                "text-white",
                                item.author === "DP"
                                  ? "bg-green-500"
                                  : "bg-orange-500"
                              )}
                            >
                              {item.author}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="font-medium mr-2">
                                  {item.author === "DP"
                                    ? "Duong Pham"
                                    : "Nguyen Minh"}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  {formatDate(item.timestamp)}
                                </span>
                              </div>
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-gray-500 hover:text-blue-500"
                                  onClick={() => handleEditContent(index)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-gray-500 hover:text-red-500"
                                  onClick={() => handleDeleteContent(index)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-2 whitespace-pre-wrap">
                              {item.text.includes("\n") ||
                              item.text.includes("•") ? (
                                <div className="pl-5">
                                  {item.text.split("\n").map((line, i) => (
                                    <div
                                      key={i}
                                      className={
                                        line.trim().startsWith("•")
                                          ? "flex"
                                          : ""
                                      }
                                    >
                                      {!line.trim().startsWith("•") &&
                                        line.trim() !== "" && (
                                          <p className="mb-1">{line}</p>
                                        )}
                                      {line.trim().startsWith("•") && (
                                        <>
                                          <span className="mr-2">•</span>
                                          <p className="mb-1">
                                            {line.substring(1).trim()}
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p>{item.text}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-2 ml-11 space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 h-8"
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
                              className="mr-1"
                            >
                              <path d="M7 10v12"></path>
                              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                            </svg>
                            Like
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 h-8"
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
                              className="mr-1"
                            >
                              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                            </svg>
                            Reply
                          </Button>
                        </div>
                        {/* {index < task.contentList.length - 1 && <hr className="my-4" />} */}

                        <TabsContent value="updates" className="mt-0">
                          <div className="p-4">
                            {/* Input field */}
                            <div className="mb-6">
                              <textarea
                                className="w-full border border-gray-200 rounded-md p-3 text-sm"
                                placeholder="Write an update and mention others with @"
                                rows={3}
                              />
                            </div>

                            {/* Comment */}
                            <div className="mb-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-green-600 text-white">
                                    DP
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                      Duong Pham{" "}
                                      <span className="text-gray-500 text-sm font-normal">
                                        3d
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button className="text-gray-400 hover:text-gray-600">
                                        <X className="h-4 w-4" />
                                      </button>
                                      <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-1 text-sm">
                                    <p>Link app 14/3/2025</p>
                                    <p className="text-blue-500">
                                      @Nguyễn Minh Anh
                                    </p>
                                    <p className="mt-2">
                                      <a
                                        href="https://4c7b1c68.staging-aptis.pages.dev"
                                        className="text-blue-500 hover:underline"
                                      >
                                        https://4c7b1c68.staging-aptis.pages.dev
                                      </a>
                                    </p>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-500">
                                    Edited
                                  </div>
                                  <div className="mt-2 flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-gray-500"
                                    >
                                      Like
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-gray-500"
                                    >
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Separator className="my-4" />

                            {/* Reply input */}
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-green-600 text-white">
                                  DP
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  className="w-full border border-gray-200 rounded-md p-3 text-sm"
                                  placeholder="Write a reply and mention others with @"
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                <div className="flex flex-col items-center mb-4">
                  <div className="flex mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-2">
                      <div className="w-10 h-2 bg-blue-300 rounded mb-1"></div>
                      <div className="w-8 h-2 bg-blue-300 rounded"></div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center text-blue-500 text-xs">
                        😊
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No updates yet</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Share progress, mention a teammate,
                    <br />
                    or upload a file to get things moving
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t mt-auto">
            <div className="p-4">
              <textarea
                className="w-full border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Write an update and mention others with @"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>
            <div className="flex items-center justify-between p-2 px-4 border-t bg-gray-50">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <span className="flex items-center">
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
                      className="mr-1"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Mention
                  </span>
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  GIF
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <span className="flex items-center">
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
                      className="mr-1"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                  </span>
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <span className="flex items-center">
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
                      className="mr-1"
                    >
                      <path d="M4 11v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8"></path>
                      <path d="M4 11V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4"></path>
                      <path d="M9.5 15v-4.5"></path>
                      <path d="M14.5 15v-4.5"></path>
                      <path d="M10 7 8 4H4"></path>
                      <path d="m14 7 2-3h4"></path>
                    </svg>
                  </span>
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleSubmitContent}
                disabled={!content.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="files" className="flex-1 p-4">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">No files uploaded yet</p>
            <Button variant="outline" className="mt-4">
              <Paperclip className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 p-4">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">No activity recorded yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

