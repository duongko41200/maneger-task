import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-config';
import { BaseRepository } from '@/lib/repositories/base.repo';

const repo = new BaseRepository();

export async function POST(
	request: Request,
	{ params }: { params: { groupId: string } }
) {
	try {
		await connectDB();
		const body = await request.json();
		const taskId = await repo.addTaskToGroup(params.groupId, body);
		return NextResponse.json({ id: taskId }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to create task' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { groupId: string } }
) {
	try {
		await connectDB();
		const { taskId, updates } = await request.json();
		await repo.updateTaskInGroup(params.groupId, taskId, updates);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to update task' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { groupId: string } }
) {
	try {
		await connectDB();
		const { taskId } = await request.json();
		await repo.deleteTaskFromGroup(params.groupId, taskId);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to delete task' },
			{ status: 500 }
		);
	}
}
