import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-config';
import { BaseRepository } from '@/lib/repositories/base.repo';
import { Group as GroupModel } from '@/lib/models/group.model';

const repo = new BaseRepository();

// Update group
export async function PUT(
	request: Request,
	{ params }: { params: { groupId: string } }
) {
	try {
		await connectDB();
		const updates = await request.json();
		await repo.updateGroup(params.groupId, updates);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error updating group:', error);
		return NextResponse.json(
			{ error: 'Failed to update group' },
			{ status: 500 }
		);
	}
}

// Delete group
export async function DELETE(
	request: Request,
	{ params }: { params: { groupId: string } }
) {
	try {
		await connectDB();
		const { groupId } = params;

		// Find and delete the group
		const deletedGroup = await GroupModel.findOneAndDelete({
			id: groupId,
		});

		if (!deletedGroup) {
			return NextResponse.json(
				{ error: 'Group not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: 'Group deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting group:', error);
		return NextResponse.json(
			{ error: 'Failed to delete group' },
			{ status: 500 }
		);
	}
}
