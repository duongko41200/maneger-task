"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DragDropInstructions() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Info className="h-4 w-4 mr-2 text-blue-500" />
            Drag & Drop Instructions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          How to organize your tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-xs space-y-2">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
            <span>Drag a task to move it between groups</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
            <span>Drag a task onto another task to make it a subtask</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1"></div>
            <span>Drag a subtask to another task to move it</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1"></div>
            <span>Drag a subtask to a group to convert it to a task</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
