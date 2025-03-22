import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-config';
import { BaseRepository } from '@/lib/repositories/base.repo';

const repo = new BaseRepository();

// Add content to task
export async function POST(
	request: Request,
	{ params }: { params: { groupId: string; taskId: string } }
) {
	try {
		await connectDB();
		const { content } = await request.json();
		await repo.addContentToTask(params.groupId, params.taskId, {
			text: content,
			timestamp: new Date().toISOString(),
			author: 'You',
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to add content' },
			{ status: 500 }
		);
	}
}

// Add subtask
export async function PUT(
	request: Request,
	{ params }: { params: { groupId: string; taskId: string } }
) {
	try {
		await connectDB();
		const { subtask } = await request.json();
		const subtaskId = await repo.addSubtaskToTask(
			params.groupId,
			params.taskId,
			subtask
		);
		return NextResponse.json({ id: subtaskId });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to add subtask' },
			{ status: 500 }
		);
	}
}

// Update subtask
export async function PATCH(
	request: Request,
	{ params }: { params: { groupId: string; taskId: string } }
) {
	try {
		await connectDB();
		const { subtaskId, updates } = await request.json();
		await repo.updateSubtask(
			params.groupId,
			params.taskId,
			subtaskId,
			updates
		);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to update subtask' },
			{ status: 500 }
		);
	}
}

// Delete subtask
export async function DELETE(
	request: Request,
	{ params }: { params: { groupId: string; taskId: string } }
) {
	try {
		await connectDB();
		const { subtaskId } = await request.json();
		await repo.deleteSubtask(params.groupId, params.taskId, subtaskId);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to delete subtask' },
			{ status: 500 }
		);
	}
}
