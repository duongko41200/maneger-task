'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Subtask } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface SubtaskRowProps {
	subtask: Subtask;
	borderColor: string;
	onOpenSidebar?: () => void;
	onDeleteSubtask?: () => void;
	onEditSubtask?: (updates: Partial<Subtask>) => void;
}

export default function SubtaskRow({
	subtask,
	borderColor,
	onOpenSidebar,
	onDeleteSubtask,
	onEditSubtask,
}: SubtaskRowProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedFields, setEditedFields] = useState<Partial<Subtask>>({
		name: subtask.name,
		priority: subtask.priority,
		status: subtask.status,
		startDate: subtask.startDate,
		endDate: subtask.endDate,
		owner: subtask.owner,
		notes: subtask.notes || '',
		budget: subtask.budget || '',
		files: subtask.files || '',
	});
	const inputRef = useRef<HTMLInputElement>(null);

	const getPriorityColor = (priority: string) => {
		switch (priority?.toLowerCase()) {
			case 'high':
				return 'bg-red-500';
			case 'medium':
				return 'bg-blue-500';
			case 'low':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-300';
		}
	};

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'done':
				return 'bg-green-500';
			case 'open':
				return 'bg-pink-500';
			case 'in progress':
				return 'bg-blue-500';
			default:
				return 'bg-gray-300';
		}
	};

	const handleEditClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsEditing(true);
	};

	const handleSaveClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onEditSubtask?.(editedFields);
		setIsEditing(false);
	};

	const handleCancelClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setEditedFields({
			name: subtask.name,
			priority: subtask.priority,
			status: subtask.status,
			startDate: subtask.startDate,
			endDate: subtask.endDate,
			owner: subtask.owner,
			notes: subtask.notes || '',
			budget: subtask.budget || '',
			files: subtask.files || '',
		});
		setIsEditing(false);
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (
			window.confirm('Are you sure you want to delete this subtask?')
		) {
			onDeleteSubtask?.();
		}
	};

	const updateField = (field: keyof Subtask, value: string) => {
		setEditedFields((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div
			className={cn(
				'grid grid-cols-12 border-b hover:bg-gray-100 pl-3 cursor-pointer group relative',
				isEditing && 'bg-gray-50'
			)}
			style={{ borderLeft: `2px solid ${borderColor}` }}
			onClick={() => !isEditing && onOpenSidebar && onOpenSidebar()}
		>
			<div className="col-span-4 p-2 flex items-center">
				<input
					type="checkbox"
					className="mr-2"
					onClick={(e) => e.stopPropagation()}
				/>
				{isEditing ? (
					<input
						ref={inputRef}
						type="text"
						value={editedFields.name}
						onChange={(e) => updateField('name', e.target.value)}
						className="text-sm border rounded px-1 flex-1"
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<span className="text-sm flex-1">{subtask.name}</span>
				)}
			</div>

			<div className="col-span-1 p-2">
				{isEditing ? (
					<Select
						value={editedFields.owner}
						onValueChange={(value) => updateField('owner', value)}
					>
						<SelectTrigger className="w-full h-8">
							<SelectValue placeholder="Owner" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="DP">DP</SelectItem>
							<SelectItem value="NM">NM</SelectItem>
						</SelectContent>
					</Select>
				) : (
					editedFields.owner && (
						<div className="flex -space-x-2">
							{editedFields.owner.split(',').map((owner, index) => (
								<Avatar
									key={index}
									className="h-6 w-6 border-2 border-white"
								>
									<AvatarFallback
										className={cn(
											'text-white text-xs',
											owner === 'NM' ? 'bg-orange-500' : 'bg-green-500'
										)}
									>
										{owner}
									</AvatarFallback>
								</Avatar>
							))}
						</div>
					)
				)}
			</div>

			<div className="col-span-1 p-2">
				{isEditing ? (
					<Select
						value={editedFields.priority}
						onValueChange={(value) => updateField('priority', value)}
					>
						<SelectTrigger className="w-full h-8">
							<SelectValue placeholder="Priority" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="High">High</SelectItem>
							<SelectItem value="Medium">Medium</SelectItem>
							<SelectItem value="Low">Low</SelectItem>
						</SelectContent>
					</Select>
				) : (
					editedFields.priority && (
						<div
							className={cn(
								'text-xs text-white py-1 px-2 rounded text-center',
								getPriorityColor(editedFields.priority)
							)}
						>
							{editedFields.priority}
						</div>
					)
				)}
			</div>

			<div className="col-span-1 p-2">
				{isEditing ? (
					<Select
						value={editedFields.status}
						onValueChange={(value) => updateField('status', value)}
					>
						<SelectTrigger className="w-full h-8">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Done">Done</SelectItem>
							<SelectItem value="Open">Open</SelectItem>
							<SelectItem value="In Progress">In Progress</SelectItem>
						</SelectContent>
					</Select>
				) : (
					editedFields.status && (
						<div
							className={cn(
								'text-xs text-white py-1 px-2 rounded text-center',
								getStatusColor(editedFields.status)
							)}
						>
							{editedFields.status}
						</div>
					)
				)}
			</div>

			<div className="col-span-1 p-2">
				{isEditing ? (
					<input
						type="date"
						value={editedFields.startDate}
						onChange={(e) => updateField('startDate', e.target.value)}
						className="text-sm border rounded px-1 w-full h-8"
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					editedFields.startDate && (
						<div className="text-xs">{editedFields.startDate}</div>
					)
				)}
			</div>
			<div className="col-span-1 p-2">
				{isEditing ? (
					<input
						type="date"
						value={editedFields.endDate}
						onChange={(e) => updateField('endDate', e.target.value)}
						className="text-sm border rounded px-1 w-full h-8"
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					editedFields.endDate && (
						<div
							className={cn(
								'text-xs ',
								new Date(
									editedFields.endDate ? editedFields.endDate : ''
								) < new Date()
									? 'text-red-500'
									: ''
							)}
						>
							{editedFields.endDate}
						</div>
					)
				)}
			</div>

			<div className="col-span-1 p-2">
				{isEditing ? (
					<input
						type="text"
						value={editedFields.notes}
						onChange={(e) => updateField('notes', e.target.value)}
						className="text-sm border rounded px-1 w-full h-8"
						placeholder="Add notes..."
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<div className="text-xs">{editedFields.notes}</div>
				)}
			</div>

			<div className="col-span-1 p-2">
				{isEditing ? (
					<input
						type="text"
						value={editedFields.budget}
						onChange={(e) => updateField('budget', e.target.value)}
						className="text-sm border rounded px-1 w-full h-8"
						placeholder="Add budget..."
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<div className="text-xs">{editedFields.budget}</div>
				)}
			</div>

			<div className="col-span-1 p-2">
				<div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
					{isEditing ? (
						<>
							<button
								onClick={handleSaveClick}
								className="p-1 hover:bg-gray-100 rounded mr-1"
								title="Save changes"
							>
								<svg
									className="h-4 w-4 text-green-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</button>
							<button
								onClick={handleCancelClick}
								className="p-1 hover:bg-gray-100 rounded mr-1"
								title="Cancel editing"
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
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</>
					) : (
						<>
							<button
								onClick={handleEditClick}
								className="p-1 hover:bg-gray-100 rounded mr-1"
								title="Edit subtask"
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
								title="Delete subtask"
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
						</>
					)}
				</div>
			</div>
		</div>
	);
}
