'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import {
	ChevronDown,
	ChevronRight,
	Info,
	GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SubtaskRow from './subtask-row';
import type { Task } from '@/lib/types';
import type { Subtask } from '@/lib/types';

interface TaskGroupProps {
	id: string;
	title: string;
	color: string;
	tasks: Task[];
	onAddTask: (groupId: string) => void;
	addSubtask: any;
	onDragStart: (
		e: React.DragEvent,
		type: string,
		id: string,
		sourceGroupId?: string
	) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent, targetGroupId: string) => void;
	index: number;
	renderTaskRow: (
		task: Task,
		expanded: boolean,
		onToggle: () => void
	) => React.ReactNode;
	onOpenSubtaskSidebar?: (
		subtask: Subtask,
		parentTask: Task,
		id: string
	) => void;
	onAddSubtask: (parentTaskId: string) => void;
	onDeleteGroup: (groupId: string) => void;
	onEditGroup: (groupId: string, newTitle: string) => void;
	onDeleteSubtask: (taskId: string, subtaskId: string) => void;
	onUpdateSubtask: (
		taskId: string,
		subtaskId: string,
		updates: Partial<Subtask>
	) => void;
}

export default function TaskGroup({
	id,
	title,
	color,
	tasks,
	onAddTask,
	onDragStart,
	onDragOver,
	onDrop,
	index,
	addSubtask,
	renderTaskRow,
	onOpenSubtaskSidebar,
	onAddSubtask,
	onDeleteGroup,
	onEditGroup,
	onDeleteSubtask,
	onUpdateSubtask,
}: TaskGroupProps) {
	const [expanded, setExpanded] = useState(true);
	const [expandedTasks, setExpandedTasks] = useState<
		Record<string, boolean>
	>({});
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState(title);
	const groupRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const toggleGroup = () => {
		setExpanded(!expanded);
	};

	const toggleTask = (taskId: string) => {
		setExpandedTasks((prev) => ({
			...prev,
			[taskId]: !prev[taskId],
		}));
	};
	console.log('tasks', tasks);
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onDragOver(e);
		setIsDraggingOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver(false);
		onDrop(e, id);
	};

	const handleEditClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsEditing(true);
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const handleEditSubmit = () => {
		if (editedTitle.trim() !== title) {
			onEditGroup(id, editedTitle);
		}
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleEditSubmit();
		} else if (e.key === 'Escape') {
			setEditedTitle(title);
			setIsEditing(false);
		}
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (window.confirm('Are you sure you want to delete this group?')) {
			onDeleteGroup(id);
		}
	};

	return (
		<div
			ref={groupRef}
			className={cn(
				`mb-4 transition-all duration-200 task-group-drop-target border rounded-md shadow-md hover:shadow-lg `,
				isDraggingOver && 'drag-over'
			)}
			style={{ borderColor: color, boxShadow: color }}
			draggable
			onDragStart={(e) => onDragStart(e, 'group', id)}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			data-group-id={id}
			data-index={index}
		>
			<div className="flex items-center py-2 cursor-pointer group">
				<div
					className="cursor-grab p-1 mr-1 hover:bg-gray-100 rounded"
					onMouseDown={(e) => {
						e.stopPropagation();
					}}
				>
					<GripVertical className="h-5 w-5 text-gray-400" />
				</div>

				<div onClick={toggleGroup} className="flex items-center flex-1">
					{expanded ? (
						<ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
					) : (
						<ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
					)}
					{isEditing ? (
						<input
							ref={inputRef}
							type="text"
							value={editedTitle}
							onChange={(e) => setEditedTitle(e.target.value)}
							onBlur={handleEditSubmit}
							onKeyDown={handleKeyDown}
							className="text-sm font-medium border rounded px-1"
							style={{ color: color }}
							onClick={(e) => e.stopPropagation()}
						/>
					) : (
						<span
							className="text-sm font-medium"
							style={{ color: color }}
						>
							{title}
						</span>
					)}
				</div>

				<div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={handleEditClick}
						className="p-1 hover:bg-gray-100 rounded mr-1"
					>
						<svg
							className="h-4 w-4 text-gray-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
					</button>
					<button
						onClick={handleDeleteClick}
						className="p-1 hover:bg-gray-100 rounded"
					>
						<svg
							className="h-4 w-4 text-gray-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</button>
				</div>
			</div>

			{expanded && (
				<div
					className={cn(
						'border rounded-md overflow-hidden',
						isDraggingOver && 'drag-over'
					)}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<div className="grid grid-cols-12 bg-gray-50 border-b text-sm font-medium text-gray-600">
						<div className="col-span-4 p-2 flex items-center">Task</div>
						<div className="col-span-1 p-2">Owner</div>
						<div className="col-span-1 p-2">Priority</div>
						<div className="col-span-1 p-2 flex items-center">
							Status
							<Info className="h-4 w-4 ml-1 text-gray-400" />
						</div>
						<div className="col-span-1 p-2 flex items-center w-fit">
							Start date
						</div>
						<div className="col-span-1 p-2 flex items-center">
							End date
						</div>
						<div className="col-span-1 p-2">Notes</div>
						<div className="col-span-1 p-2">Budget</div>
						<div className="col-span-1 p-2 flex items-center">
							Actions
						</div>
					</div>

					<div
						className={cn('task-list', isDraggingOver && 'drag-over')}
					>
						{tasks.map((task) => (
							<div key={task.id}>
								{renderTaskRow(task, !!expandedTasks[task.id], () =>
									toggleTask(task.id)
								)}

								{expandedTasks[task.id] &&
									task.subtasks &&
									task.subtasks.map((subtask) => (
										<>
											<SubtaskRow
												key={subtask.id}
												subtask={subtask}
												borderColor={color}
												onOpenSidebar={() =>
													onOpenSubtaskSidebar &&
													onOpenSubtaskSidebar(subtask, task, id)
												}
												onDeleteSubtask={() => {
													const taskId = task.id;
													const subtaskId = subtask.id;
													const updatedTasks = tasks.map((t) => {
														if (t.id === taskId) {
															return {
																...t,
																subtasks:
																	t.subtasks?.filter(
																		(s) => s.id !== subtaskId
																	) || [],
															};
														}
														return t;
													});
													onDeleteSubtask(taskId, subtaskId);
												}}
												onEditSubtask={(updates) => {
													const taskId = task.id;
													const subtaskId = subtask.id;
													const updatedTasks = tasks.map((t) => {
														if (t.id === taskId) {
															return {
																...t,
																subtasks:
																	t.subtasks?.map((s) =>
																		s.id === subtaskId
																			? { ...s, ...updates }
																			: s
																	) || [],
															};
														}
														return t;
													});
													onUpdateSubtask(taskId, subtaskId, updates);
												}}
											/>
										</>
									))}

								{expandedTasks[task.id] && (
									<div
										className="pl-10 border-l-2 ml-6"
										style={{ borderColor: color }}
									>
										<div
											className="flex items-center p-2 text-gray-400 text-sm hover:bg-gray-50 hover:text-black cursor-pointer"
											onClick={() => onAddSubtask(task.id)}
										>
											+ Add subtask
										</div>
									</div>
								)}
							</div>
						))}

						<div
							className="flex items-center p-2 text-gray-400 text-sm hover:bg-gray-50 hover:text-black cursor-pointer"
							onClick={() => onAddTask(title)}
						>
							+ Add task
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
