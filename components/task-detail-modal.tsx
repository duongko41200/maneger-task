"use client";

import { useState } from "react";
import {
  X,
  MessageSquare,
  Paperclip,
  User,
  MoreHorizontal,
  SmilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task } from "@/lib/types";

import { Separator } from "@/components/ui/separator";

interface TaskDetailModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (taskId: string, content: string) => void;
}

export default function TaskDetailModal({
  isOpen,
  task,
  onClose,
  onUpdateTask,
}: TaskDetailModalProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (task && content.trim()) {
      onUpdateTask(task.id, content);
      setContent("");
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Set lịch đăng bài</h2>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="bg-green-500 text-white text-xs">
                  DP
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="bg-orange-500 text-white text-xs">
                  NM
                </AvatarFallback>
              </Avatar>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="updates" className="flex-1 flex flex-col">
          <TabsList className="px-4 py-2 border-b">
            <TabsTrigger
              value="updates"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Updates
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Files
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="updates" className="flex-1 p-4 overflow-auto">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                {!task.content ? (
                  <TabsContent value="updates" className="mt-0">
                    <div className="p-4">
                      {/* Action buttons */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500"
                          >
                            <span className="mr-1">@</span> Mention
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500"
                          >
                            <Paperclip className="h-4 w-4 mr-1" /> GIF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500"
                          >
                            <SmilePlus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-500"
                          >
                            Update via email
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-500"
                          >
                            Give feedback
                          </Button>
                        </div>
                      </div>

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
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
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
                )}
              </div>

              <div className="border rounded-lg mt-4">
                <div className="p-2">
                  <textarea
                    className="w-full border-0 focus:outline-none resize-none"
                    placeholder="Write an update and mention others with @"
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex items-center justify-between p-2 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      Mention
                    </Button>
                    <Button variant="ghost" size="sm">
                      GIF
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4 mr-1" />
                    </Button>
                  </div>
                  <Button size="sm" onClick={handleSubmit}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="flex-1 p-4">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500">No files uploaded yet</p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 p-4">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500">No activity recorded yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
