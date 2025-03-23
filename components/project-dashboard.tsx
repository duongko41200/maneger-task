'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import Sidebar from './sidebar';
import ProjectHeader from './project-header';
import ProjectTabs from './project-tabs';
import TaskToolbar from './task-toolbar';
import TaskGroup from './task-group';
import AddGroupModal from './add-group-modal';
import AddTaskModal from './add-task-modal';
import TaskSidebar from './task-sidebar';
import type { Task, Group, Subtask } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import EditableTaskRow from './editable-task-row';
import AddSubtaskModal from './add-subtask-modal';
import { groupApi, taskApi, subtaskApi } from '@/lib/api-services';
import { RefreshCw } from 'lucide-react';
import { useGroups } from '@/lib/contexts/GroupContext';
import { nanoid } from 'nanoid';
import { Spinner } from '@/components/ui/spinner';

export default function ProjectDashboard() {
	const {
		groups,
		dispatch,
		syncData,
		deleteGroup,
		updateGroup,
		deleteSubtask,
		updateSubtask,
		isLoading,
	} = useGroups();
	const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
	const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
	const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);
	const [currentGroupId, setCurrentGroupId] = useState('');
	const [currentTaskId, setCurrentTaskId] = useState('');
	const [currentTask, setCurrentTask] = useState<Task | null>(null);
	const [curentContentList, setCurentContentList] = useState<any>([]);
	const [isAddSubtaskModalOpen, setIsAddSubtaskModalOpen] =
		useState(false);

	// Drag and drop state
	const dragItem = useRef<{
		type: string;
		id: string;
		sourceGroupId?: string;
	} | null>(null);

	const handleAddGroup = async (name: string) => {
		const newGroup = {
			title: name,
			color: getRandomColor(),
			tasks: [],
			position: groups.length,
		};

		try {
			// const groupId = await groupApi.create(newGroup);
			const groupWithId = { ...newGroup, id: nanoid() };
			dispatch({ type: 'ADD_GROUP', payload: groupWithId });
			toast({
				title: 'Group created',
				description: `Group "${name}" has been created successfully.`,
			});
		} catch (error) {
			console.error('Error adding group:', error);
			toast({
				title: 'Error',
				description: 'Failed to create group. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleAddTask = async (groupId: string, task: any) => {
		try {
			dispatch({
				type: 'ADD_TASK',
				payload: {
					groupId,
					task: { ...task, id: nanoid(), contentList: [] },
				},
			});

			toast({
				title: 'Task created',
				description: `Task "${task.name}" has been created successfully.`,
			});
		} catch (error) {
			console.error('Error adding task:', error);
			toast({
				title: 'Error',
				description: 'Failed to create task. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleUpdateTask = async (
		taskId: string,
		updates: Partial<Task>
	) => {
		const groupId = getGroupIdForTask(taskId);

		try {
			// await taskApi.update(groupId, taskId, updates);
			dispatch({
				type: 'UPDATE_TASK',
				payload: { groupId, taskId, updates },
			});

			toast({
				title: 'Task updated',
				description: 'Task has been updated successfully.',
			});
		} catch (error) {
			console.error('Error updating task:', error);
			toast({
				title: 'Error',
				description: 'Failed to update task. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		let taskName = '';
		let groupTitle = '';

		const groupId = getGroupIdForTask(taskId);

		try {
			dispatch({
				type: 'DELETE_TASK',
				payload: { groupId, taskId },
			});

			if (taskName) {
				toast({
					title: 'Task deleted',
					description: `Task "${taskName}" has been deleted from "${groupTitle}".`,
				});
			}

			if (currentTask?.id === taskId) {
				setIsTaskSidebarOpen(false);
				setCurrentTask(null);
			}
		} catch (error) {
			console.error('Error deleting task:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete task. Please try again.',
				variant: 'destructive',
			});
		}
	};

	// const handleAddContent = async (taskId: string, content: string) => {
	// 	const groupId = getGroupIdForTask(taskId);

	// 	try {
	// 		// await subtaskApi.addContent(groupId, taskId, content);
	// 		dispatch({
	// 			type: 'ADD_CONTENT',
	// 			payload: {
	// 				groupId,
	// 				taskId,
	// 				subtaskId,
	// 				content: {
	// 					text: content,
	// 					timestamp: new Date().toISOString(),
	// 					author: 'You',
	// 				},
	// 			},
	// 		});

	// 		toast({
	// 			title: 'Content added',
	// 			description: 'Your content has been saved successfully.',
	// 		});
	// 	} catch (error) {
	// 		console.error('Error adding content:', error);
	// 		toast({
	// 			title: 'Error',
	// 			description: 'Failed to add content. Please try again.',
	// 			variant: 'destructive',
	// 		});
	// 	}
	// };

	const handleAddSubtask = async (taskId: string, subtask: Subtask) => {
		const groupId = getGroupIdForTask(taskId);

		try {
			dispatch({
				type: 'ADD_SUBTASK',
				payload: {
					groupId,
					taskId,
					subtask: { ...subtask, id: nanoid() },
				},
			});

			toast({
				title: 'Subtask added',
				description: `Subtask "${subtask.name}" has been added.`,
			});
		} catch (error) {
			console.error('Error adding subtask:', error);
			toast({
				title: 'Error',
				description: 'Failed to add subtask. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleUpdateSubtask = async (
		taskId: string,
		subtaskId: string,
		updates: Partial<Subtask>
	) => {
		const groupId = getGroupIdForTask(taskId);

		try {
			// await subtaskApi.update(groupId, taskId, subtaskId, updates);
			dispatch({
				type: 'UPDATE_SUBTASK',
				payload: { groupId, taskId, subtaskId, updates },
			});

			toast({
				title: 'Subtask updated',
				description: 'Subtask has been updated successfully.',
			});
		} catch (error) {
			console.error('Error updating subtask:', error);
			toast({
				title: 'Error',
				description: 'Failed to update subtask. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteSubtask = async (
		taskId: string,
		subtaskId: string
	) => {
		const groupId = getGroupIdForTask(taskId);

		try {
			// await subtaskApi.delete(groupId, taskId, subtaskId);
			dispatch({
				type: 'DELETE_SUBTASK',
				payload: { groupId, taskId, subtaskId },
			});

			toast({
				title: 'Subtask deleted',
				description: 'Subtask has been deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting subtask:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete subtask. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const openAddTaskModal = (groupId: string) => {
		setCurrentGroupId(groupId);
		setIsAddTaskModalOpen(true);
	};

	const openAddSubtaskModal = (parentTaskId: string) => {
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

	const openSubtaskSidebar = async (
		subtask: Subtask,
		parentTask: Task,
		id: string
	) => {
		const subtaskAsTask: Task = {
			id: subtask.id,
			name: subtask.name,
			owner: subtask.owner,
			priority: subtask.priority,
			status: subtask.status,
			startDate: subtask.startDate,
			endDate: subtask.endDate,
			contentList: [],
			parentTaskId: parentTask.id,
		};

		const filterSubtask = groups
			.find((group) => group.id === id)
			?.tasks.find((task) => task.id === parentTask.id)
			?.subtasks?.find((subtask) => subtask.id === subtaskAsTask.id);

		console.log('filterSubtask', filterSubtask);

		setCurrentGroupId(id);
		setCurrentTask(subtaskAsTask);
		setCurentContentList(filterSubtask || []);
		setIsTaskSidebarOpen(true);
	};

	const getRandomColor = () => {
		const colors = [
			'#0ea5e9',
			'#ec4899',
			'#8b5cf6',
			'#10b981',
			'#f59e0b',
			'#ef4444',
		];
		return colors[Math.floor(Math.random() * colors.length)];
	};

	const getGroupIdForTask = (taskId: string): string => {
		for (const group of groups) {
			if (group.tasks.some((task) => task.id === taskId)) {
				return group.id;
			}
		}
		return '';
	};

	const handleDragStart = (
		e: React.DragEvent,
		type: string,
		id: string,
		sourceGroupId?: string
	) => {
		dragItem.current = { type, id, sourceGroupId };
		e.dataTransfer.setData(
			'text/plain',
			JSON.stringify({ type, id, sourceGroupId })
		);

		if (type === 'task') {
			const taskElement = document.querySelector(
				`[data-task-id="${id}"]`
			);
			if (taskElement) {
				const rect = taskElement.getBoundingClientRect();
				const ghostElement = document.createElement('div');
				ghostElement.style.width = `${rect.width}px`;
				ghostElement.style.height = `${rect.height}px`;
				ghostElement.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
				ghostElement.style.position = 'absolute';
				ghostElement.style.top = '-1000px';
				document.body.appendChild(ghostElement);
				e.dataTransfer.setDragImage(ghostElement, 0, 0);
				setTimeout(() => {
					document.body.removeChild(ghostElement);
				}, 0);
			}
		} else if (type === 'group') {
			const groupElement = document.querySelector(
				`[data-group-id="${id}"]`
			);
			if (groupElement) {
				const rect = groupElement.getBoundingClientRect();
				const ghostElement = document.createElement('div');
				ghostElement.style.width = `${rect.width}px`;
				ghostElement.style.height = `${rect.height}px`;
				ghostElement.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
				ghostElement.style.position = 'absolute';
				ghostElement.style.top = '-1000px';
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
		e.dataTransfer.dropEffect = 'move';
	};

	const handleDrop = async (
		e: React.DragEvent,
		targetGroupId: string,
		targetIndex: number
	) => {
		e.preventDefault();
		e.stopPropagation();

		if (!dragItem.current) return;

		const { type, id, sourceGroupId } = dragItem.current;

		if (type === 'task' && sourceGroupId) {
			const sourceGroup = groups.find(
				(group) => group.id === sourceGroupId
			);
			const targetGroup = groups.find(
				(group) => group.id === targetGroupId
			);

			if (
				sourceGroup &&
				targetGroup &&
				sourceGroupId !== targetGroupId
			) {
				const task = sourceGroup.tasks.find((t) => t.id === id);

				if (task) {
					try {
						dispatch({
							type: 'MOVE_TASK',
							payload: {
								sourceGroupId,
								targetGroupId,
								taskId: id,
								task,
							},
						});

						toast({
							title: 'Task moved',
							description: `Task "${task.name}" has been moved from "${sourceGroup.title}" to "${targetGroup.title}".`,
						});
					} catch (error) {
						console.error('Error moving task:', error);
						toast({
							title: 'Error',
							description: 'Failed to move task. Please try again.',
							variant: 'destructive',
						});
					}
				}
			}
		} else if (type === 'group') {
			const sourceIndex = groups.findIndex((group) => group.id === id);
			if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
				try {
					dispatch({
						type: 'REORDER_GROUPS',
						payload: {
							sourceIndex,
							targetIndex,
						},
					});

					toast({
						title: 'Group reordered',
						description: 'Group has been reordered successfully.',
					});
				} catch (error) {
					console.error('Error reordering group:', error);
					toast({
						title: 'Error',
						description: 'Failed to reorder group. Please try again.',
						variant: 'destructive',
					});
				}
			}
		}

		dragItem.current = null;
	};

	const handleDeleteGroup = async (groupId: string) => {
		await deleteGroup(groupId);
		try {
			dispatch({
				type: 'DELETE_GROUP',
				payload: groupId,
			});
			toast({
				title: 'Group deleted',
				description: 'Group has been deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting group:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete group. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleEditGroup = async (groupId: string, newTitle: string) => {
		try {
			dispatch({
				type: 'UPDATE_GROUP',
				payload: { groupId, updates: { title: newTitle } },
			});
			toast({
				title: 'Group updated',
				description: 'Group has been updated successfully.',
			});
		} catch (error) {
			console.error('Error updating group:', error);
			toast({
				title: 'Error',
				description: 'Failed to update group. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteSubtaskFromUI = async (
		taskId: string,
		subtaskId: string
	) => {
		try {
			const groupId = getGroupIdForTask(taskId);
			dispatch({
				type: 'DELETE_SUBTASK',
				payload: { groupId, taskId, subtaskId },
			});
			toast({
				title: 'Subtask deleted',
				description: 'Subtask has been deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting subtask:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete subtask. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleEditSubtaskFromUI = async (
		taskId: string,
		subtaskId: string,
		updates: Partial<Subtask>
	) => {
		try {
			const groupId = getGroupIdForTask(taskId);
			dispatch({
				type: 'UPDATE_SUBTASK',
				payload: { groupId, taskId, subtaskId, updates },
			});
			toast({
				title: 'Subtask updated',
				description: 'Subtask has been updated successfully.',
			});
		} catch (error) {
			console.error('Error updating subtask:', error);
			toast({
				title: 'Error',
				description: 'Failed to update subtask. Please try again.',
				variant: 'destructive',
			});
		}
	};

	return (
		<>
			<Sidebar />

			<div className="flex-1 flex flex-col h-full overflow-hidden">
				<ProjectHeader projectName="project Aptis" />
				<div className="flex items-center justify-between px-4 py-2 border-b">
					<ProjectTabs />
					<Button
						variant="outline"
						size="sm"
						onClick={syncData}
						className="flex items-center gap-2"
						disabled={isLoading}
					>
						<RefreshCw className="h-4 w-4" />

						{isLoading ? 'Syncing...' : 'Sync Data'}
					</Button>
				</div>
				{/* <TaskToolbar /> */}

				{isLoading && (
					<div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
						<Spinner size="lg" />
					</div>
				)}

				<div className="flex-1 overflow-auto p-4  relative">
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
										handleDragStart(e, 'task', task.id, group.id)
									}
									groupId={group.id}
									onUpdate={handleUpdateTask}
									onDelete={handleDeleteTask}
									onOpenSidebar={openTaskSidebar}
								/>
							)}
							onDeleteGroup={handleDeleteGroup}
							onEditGroup={handleEditGroup}
							onDeleteSubtask={handleDeleteSubtaskFromUI}
							onUpdateSubtask={handleEditSubtaskFromUI}
						/>
					))}

					<Button
						variant="outline"
						className="mt-4"
						onClick={() => setIsAddGroupModalOpen(true)}
						disabled={isLoading}
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

			{isTaskSidebarOpen && currentTask && (
				<TaskSidebar
					isOpen={isTaskSidebarOpen}
					task={currentTask}
					curentContentList={curentContentList}
					onClose={() => {
						setIsTaskSidebarOpen(false);
						setCurrentTask(null);
					}}
					// onAddContent={(taskId, content) =>
					// 	handleAddContent(taskId, content)
					// }
					onUpdateTask={(taskId, updates) =>
						handleUpdateTask(taskId, updates)
					}
					onAddSubtask={(taskId, subtask) =>
						handleAddSubtask(taskId, subtask)
					}
					onUpdateSubtask={(taskId, subtaskId, updates) =>
						handleEditSubtaskFromUI(taskId, subtaskId, updates)
					}
					onDeleteSubtask={(taskId, subtaskId) =>
						handleDeleteSubtask(taskId, subtaskId)
					}
					groupId={currentGroupId}
				/>
			)}
		</>
	);
}
