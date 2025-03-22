import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-config';
import { BaseRepository } from '@/lib/repositories/base.repo';

const repo = new BaseRepository();

// Update subtask
export async function PUT(
	request: Request,
	{
		params,
	}: { params: { groupId: string; taskId: string; subtaskId: string } }
) {
	try {
		await connectDB();
		const updates = await request.json();
		await repo.updateSubtask(
			params.groupId,
			params.taskId,
			params.subtaskId,
			updates
		);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error updating subtask:', error);
		return NextResponse.json(
			{ error: 'Failed to update subtask' },
			{ status: 500 }
		);
	}
}

// Delete subtask
export async function DELETE(
	request: Request,
	{
		params,
	}: { params: { groupId: string; taskId: string; subtaskId: string } }
) {
	try {
		await connectDB();
		await repo.deleteSubtask(
			params.groupId,
			params.taskId,
			params.subtaskId
		);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting subtask:', error);
		return NextResponse.json(
			{ error: 'Failed to delete subtask' },
			{ status: 500 }
		);
	}
}

// Move subtask to another task
export async function PATCH(
	request: Request,
	{
		params,
	}: { params: { groupId: string; taskId: string; subtaskId: string } }
) {
	try {
		await connectDB();
		const { targetTaskId } = await request.json();

		// Get the source task and subtask
		const group = await repo
			.getGroups()
			.then((groups) => groups.find((g) => g.id === params.groupId));

		if (!group) throw new Error('Group not found');

		const sourceTask = group.tasks.find((t) => t.id === params.taskId);
		if (!sourceTask) throw new Error('Source task not found');

		const subtask = sourceTask.subtasks.find(
			(s) => s.id === params.subtaskId
		);
		if (!subtask) throw new Error('Subtask not found');

		// Remove subtask from source task
		await repo.deleteSubtask(
			params.groupId,
			params.taskId,
			params.subtaskId
		);

		// Add subtask to target task
		await repo.addSubtaskToTask(params.groupId, targetTaskId, {
			name: subtask.name,
			owner: subtask.owner,
			priority: subtask.priority,
			status: subtask.status,
			startDate: subtask.startDate,
			endDate: subtask.endDate,
			contentList: subtask.contentList || [],
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error moving subtask:', error);
		return NextResponse.json(
			{ error: 'Failed to move subtask' },
			{ status: 500 }
		);
	}
}
