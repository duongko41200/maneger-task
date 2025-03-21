"use client";

import type React from "react";

import { useState, useRef } from "react";
import { nanoid } from "nanoid";
import Sidebar from "./sidebar";
import ProjectHeader from "./project-header";
import ProjectTabs from "./project-tabs";
import TaskToolbar from "./task-toolbar";
import TaskGroup from "./task-group";
import AddGroupModal from "./add-group-modal";
import AddTaskModal from "./add-task-modal";
import TaskSidebar from "./task-sidebar";
import type { Task, Group, Subtask } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import EditableTaskRow from "./editable-task-row";
import AddSubtaskModal from "./add-subtask-modal";

export default function ProjectDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3004/tasks");
        const data = await response.json();

        console.log({ data });
        setGroups(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState("");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isAddSubtaskModalOpen, setIsAddSubtaskModalOpen] = useState(false);

  // Drag and drop state
  const dragItem = useRef<{
    type: string;
    id: string;
    sourceGroupId?: string;
  } | null>(null);

  const handleAddGroup = async (name: string) => {
    const newGroup = {
      id: nanoid(),
      title: name,
      color: getRandomColor(),
      tasks: [],
    };

    try {
      const response = await fetch("http://localhost:3004/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGroup),
      });
      const data = await response.json();

      console.log({ tes: data });
      setGroups([...groups, newGroup]);
      toast({
        title: "Group created",
        description: `Group "${name}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Error adding group:", error);
    }

    //  .then((response) => {
    //    console.log("response", response.json());

    //    return response.json();
    //  })
    //  .then(() => {
    //    setGroups([...groups, newGroup]);
    //    toast({
    //      title: "Group created",
    //      description: `Group "${name}" has been created successfully.`,
    //    });
    //  });
  };

  const handleAddTask = (groupId: string, task: any) => {
    const newTask = {
      id: nanoid(),
      ...task,
      contentList: [],
    };

    console.log({ tes: groupId });

    fetch(`http://localhost:3004/tasks/${groupId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: [
          ...(groups.find((group) => group.id === groupId)?.tasks || []),
          newTask,
        ],
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setGroups(
          groups.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                tasks: [...group.tasks, newTask],
              };
            }
            return group;
          })
        );

        toast({
          title: "Task created",
          description: `Task "${task.name}" has been created successfully.`,
        });
      });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const groupId = getGroupIdForTask(taskId);

    fetch(`http://localhost:3004/tasks/${groupId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: groups
          .find((group) => group.id === groupId)
          ?.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                ...updates,
              };
            }
            return task;
          }),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setGroups(
          groups.map((group) => {
            return {
              ...group,
              tasks: group.tasks.map((task) => {
                if (task.id === taskId) {
                  return {
                    ...task,
                    ...updates,
                  };
                }
                return task;
              }),
            };
          })
        );

        toast({
          title: "Task updated",
          description: "Task has been updated successfully.",
        });
      });
  };

  const handleDeleteTask = (taskId: string) => {
    let taskName = "";
    let groupTitle = "";
    const groupId = getGroupIdForTask(taskId);

    fetch(`http://localhost:3004/tasks/${groupId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: groups
          .find((group) => group.id === groupId)
          ?.tasks.filter((task) => task.id !== taskId),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setGroups(
          groups.map((group) => {
            const taskIndex = group.tasks.findIndex(
              (task) => task.id === taskId
            );
            if (taskIndex !== -1) {
              taskName = group.tasks[taskIndex].name;
              groupTitle = group.title;
              return {
                ...group,
                tasks: group.tasks.filter((task) => task.id !== taskId),
              };
            }
            return group;
          })
        );

        if (taskName) {
          toast({
            title: "Task deleted",
            description: `Task "${taskName}" has been deleted from "${groupTitle}".`,
          });
        }

        // Close sidebar if the deleted task was open
        if (currentTask?.id === taskId) {
          setIsTaskSidebarOpen(false);
          setCurrentTask(null);
        }
      });
  };

  const handleAddContent = (taskId: string, content: string) => {
    const groupId = getGroupIdForTask(taskId);

    fetch(`http://localhost:3004/tasks/${groupId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: groups
          .find((group) => group.id === groupId)
          ?.tasks.map((task) => {
            if (task.id === taskId) {
              const contentList = task.contentList || [];
              return {
                ...task,
                contentList: [
                  ...contentList,
                  {
                    text: content,
                    timestamp: new Date().toISOString(),
                    author: "You",
                  },
                ],
              };
            }
            return task;
          }),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setGroups(
          groups.map((group) => {
            return {
              ...group,
              tasks: group.tasks.map((task) => {
                if (task.id === taskId) {
                  const contentList = task.contentList || [];
                  return {
                    ...task,
                    contentList: [
                      ...contentList,
                      {
                        text: content,
                        timestamp: new Date().toISOString(),
                        author: "You",
                      },
                    ],
                  };
                }
                return task;
              }),
            };
          })
        );

        toast({
          title: "Content added",
          description: "Your content has been saved successfully.",
        });
      });
  };

  const handleAddSubtask = (taskId: string, subtask: Subtask) => {
    const groupId = getGroupIdForTask(taskId);

    console.log("groupId", groupId);

    fetch(`http://localhost:3004/tasks/${groupId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: groups
          .find((group) => group.id === groupId)
          ?.tasks.map((task) => {
            if (task.id === taskId) {
              const subtasks = task.subtasks || [];
              return {
                ...task,
                subtasks: [...subtasks, subtask],
              };
            }
            return task;
          }),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setGroups(
          groups.map((group) => {
            return {
              ...group,
              tasks: group.tasks.map((task) => {
                if (task.id === taskId) {
                  const subtasks = task.subtasks || [];
                  return {
                    ...task,
                    subtasks: [...subtasks, subtask],
                  };
                }
                return task;
              }),
            };
          })
        );

        toast({
          title: "Subtask added",
          description: `Subtask "${subtask.name}" has been added.`,
        });
      });
  };

  const handleUpdateSubtask = (
    taskId: string,
    subtaskId: string,
    updates: Partial<Subtask>
  ) => {
    const groupId = getGroupIdForTask(taskId);

    fetch(`http://localhost:3004/tasks/${groupId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: groups
          .find((group) => group.id === groupId)
          ?.tasks.map((task) => {
            if (task.id === taskId && task.subtasks) {
              return {
                ...task,
                subtasks: task.subtasks.map((subtask) => {
                  if (subtask.id === subtaskId) {
                    return {
                      ...subtask,
                      ...updates,
                    };
                  }
                  return subtask;
                }),
              };
            }
            return task;
          }),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setGroups(
          groups.map((group) => {
            return {
              ...group,
              tasks: group.tasks.map((task) => {
                if (task.id === taskId && task.subtasks) {
                  return {
                    ...task,
                    subtasks: task.subtasks.map((subtask) => {
                      if (subtask.id === subtaskId) {
                        return {
                          ...subtask,
                          ...updates,
                        };
                      }
                      return subtask;
                    }),
                  };
                }
                return task;
              }),
            };
          })
        );

        toast({
          title: "Subtask updated",
          description: "Subtask has been updated successfully.",
        });
      });
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    const groupId = getGroupIdForTask(taskId);

    fetch(`http://localhost:3004/tasks/${groupId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: groups
          .find((group) => group.id === groupId)
          ?.tasks.map((task) => {
            if (task.id === taskId && task.subtasks) {
              return {
                ...task,
                subtasks: task.subtasks.filter(
                  (subtask) => subtask.id !== subtaskId
                ),
              };
            }
            return task;
          }),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setGroups(
          groups.map((group) => {
            return {
              ...group,
              tasks: group.tasks.map((task) => {
                if (task.id === taskId && task.subtasks) {
                  return {
                    ...task,
                    subtasks: task.subtasks.filter(
                      (subtask) => subtask.id !== subtaskId
                    ),
                  };
                }
                return task;
              }),
            };
          })
        );

        toast({
          title: "Subtask deleted",
          description: "Subtask has been deleted successfully.",
        });
      });
  };

  const openAddTaskModal = (groupId: string) => {
    setCurrentGroupId(groupId);
    setIsAddTaskModalOpen(true);
  };
  const openAddSubtaskModal = (parentTaskId: string) => {
    console.log("parentTaskId", parentTaskId);
    setCurrentTaskId(parentTaskId);
    setIsAddSubtaskModalOpen(true);
  };

  const handleAddSubtasks = (groupId: string) => {
    setCurrentGroupId(groupId);
    setIsAddTaskModalOpen(true);
  };

  const openTaskSidebar = (task: Task) => {
    setCurrentTask(task);
    setIsTaskSidebarOpen(true);
  };

  // Add a new function to handle opening the sidebar for subtasks
  const openSubtaskSidebar = (subtask: Subtask, parentTask: Task) => {
    // Create a temporary task object from the subtask to display in the sidebar
    const subtaskAsTask: Task = {
      id: subtask.id,
      name: subtask.name,
      owner: subtask.owner,
      priority: subtask.priority,
      status: subtask.status,
      startDate: subtask.startDate,
      endDate: subtask.endDate,
      contentList: [],
      // Add a reference to the parent task
      parentTaskId: parentTask.id,
    };

    setCurrentTask(subtaskAsTask);
    setIsTaskSidebarOpen(true);
  };

  const getRandomColor = () => {
    const colors = [
      "#0ea5e9",
      "#ec4899",
      "#8b5cf6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Find the group ID for a task
  const getGroupIdForTask = (taskId: string): string => {
    for (const group of groups) {
      if (group.tasks.some((task) => task.id === taskId)) {
        return group.id;
      }
    }
    return "";
  };

  // Drag and drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    type: string,
    id: string,
    sourceGroupId?: string
  ) => {
    dragItem.current = { type, id, sourceGroupId };

    // Set data for HTML5 drag and drop
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ type, id, sourceGroupId })
    );

    // Set a ghost image for dragging
    if (type === "task") {
      const taskElement = document.querySelector(`[data-task-id="${id}"]`);
      if (taskElement) {
        const rect = taskElement.getBoundingClientRect();
        const ghostElement = document.createElement("div");
        ghostElement.style.width = `${rect.width}px`;
        ghostElement.style.height = `${rect.height}px`;
        ghostElement.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
        ghostElement.style.position = "absolute";
        ghostElement.style.top = "-1000px";
        document.body.appendChild(ghostElement);
        e.dataTransfer.setDragImage(ghostElement, 0, 0);
        setTimeout(() => {
          document.body.removeChild(ghostElement);
        }, 0);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragItem.current) return;

    const { type, id, sourceGroupId } = dragItem.current;

    if (type === "task" && sourceGroupId) {
      // Move task between groups
      const sourceGroup = groups.find((group) => group.id === sourceGroupId);
      const targetGroup = groups.find((group) => group.id === targetGroupId);

      if (sourceGroup && targetGroup && sourceGroupId !== targetGroupId) {
        const taskIndex = sourceGroup.tasks.findIndex((task) => task.id === id);

        if (taskIndex !== -1) {
          const [movedTask] = sourceGroup.tasks.splice(taskIndex, 1);

          // Update the groups state to move the task
          setGroups(
            groups.map((group) => {
              if (group.id === sourceGroupId) {
                return {
                  ...group,
                  tasks: sourceGroup.tasks.filter((task) => task.id !== id),
                };
              }
              if (group.id === targetGroupId) {
                return {
                  ...group,
                  tasks: [...group.tasks, movedTask],
                };
              }
              return group;
            })
          );

          // Update the server
          fetch(`http://localhost:3004/tasks/${sourceGroupId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tasks: sourceGroup.tasks.filter((task) => task.id !== id),
            }),
          });

          fetch(`http://localhost:3004/tasks/${targetGroupId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tasks: [...targetGroup.tasks, movedTask],
            }),
          });

          toast({
            title: "Task moved",
            description: `Task "${movedTask.name}" has been moved from "${sourceGroup.title}" to "${targetGroup.title}".`,
          });
        }
      }
    } else if (type === "group") {
      // Reorder groups
      const draggedGroupIndex = groups.findIndex((group) => group.id === id);
      const targetGroupIndex = groups.findIndex(
        (group) => group.id === targetGroupId
      );

      if (draggedGroupIndex !== -1 && targetGroupIndex !== -1) {
        const newGroups = [...groups];
        const [draggedGroup] = newGroups.splice(draggedGroupIndex, 1);
        newGroups.splice(targetGroupIndex, 0, draggedGroup);
        setGroups(newGroups);

        toast({
          title: "Group moved",
          description: `Group "${draggedGroup.title}" has been moved successfully.`,
        });
      }
    }

    dragItem.current = null;
  };

  return (
    <>
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ProjectHeader projectName="project Aptis" />
        <ProjectTabs />
        <TaskToolbar />

        <div className="flex-1 overflow-auto p-4">
          {groups.map((group, index) => (
            <TaskGroup
              key={group.id}
              id={group.id}
              title={group.title}
              color={group.color}
              tasks={group.tasks}
              onAddTask={() => openAddTaskModal(group.id)}
              onAddSubtask={openAddSubtaskModal}
              addSubtask={handleAddSubtasks}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              index={index}
              onOpenSubtaskSidebar={openSubtaskSidebar}
              renderTaskRow={(task, expanded, onToggle) => (
                <EditableTaskRow
                  task={task}
                  expanded={expanded}
                  onToggle={onToggle}
                  borderColor={group.color}
                  onDragStart={(e) =>
                    handleDragStart(e, "task", task.id, group.id)
                  }
                  groupId={group.id}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onOpenSidebar={openTaskSidebar}
                />
              )}
            />
          ))}

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsAddGroupModalOpen(true)}
          >
            Add new group
          </Button>
        </div>
      </div>

      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        onAddGroup={handleAddGroup}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        groupId={currentGroupId}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
      <AddSubtaskModal
        isOpen={isAddSubtaskModalOpen}
        parentTaskId={currentTaskId}
        onClose={() => setIsAddSubtaskModalOpen(false)}
        onAddSubtask={handleAddSubtask}
      />

      <TaskSidebar
        isOpen={isTaskSidebarOpen}
        task={currentTask}
        onClose={() => setIsTaskSidebarOpen(false)}
        onUpdateTask={handleUpdateTask}
        onAddContent={handleAddContent}
        onAddSubtask={handleAddSubtask}
        onUpdateSubtask={handleUpdateSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        groupId={currentTask ? getGroupIdForTask(currentTask.id) : ""}
      />
    </>
  );
}
