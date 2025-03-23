import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-config';
import { BaseRepository } from '@/lib/repositories/base.repo';
import type { Group } from '@/lib/types';
import type {
	IGroup,
	ITask,
	ISubtask,
	IContent,
} from '@/lib/models/group.model';
import { Group as GroupModel } from '@/lib/models/group.model';

const repo = new BaseRepository();

const transformContent = (content: any): IContent => ({
	text: content.text || '',
	timestamp: content.timestamp || new Date().toISOString(),
	author: content.author || '',
});

const transformSubtask = (subtask: any): ISubtask => ({
	id: subtask.id,
	name: subtask.name,
	owner: subtask.owner || '',
	priority: subtask.priority || '',
	status: subtask.status || '',
	startDate: subtask.startDate || '',
	endDate: subtask.endDate || '',
	contentList: (subtask.contentList || []).map(transformContent),
});

const transformTask = (task: any): ITask => ({
	id: task.id,
	name: task.name,
	owner: task.owner || '',
	priority: task.priority || '',
	status: task.status || '',
	startDate: task.startDate || '',
	endDate: task.endDate || '',
	count: task.count || 0,
	notes: task.notes || '',
	budget: task.budget || '',
	subtasks: (task.subtasks || []).map(transformSubtask),
	contentList: (task.contentList || []).map(transformContent),
});

export async function POST(request: Request) {
	try {
		await connectDB();
		const groups: Group[] = await request.json();

		// Delete groups that no longer exist
		const existingGroupIds = (await GroupModel.find({})).map(
			(g) => g.id
		);
		const newGroupIds = groups.map((g) => g.id);
		const groupsToDelete = existingGroupIds.filter(
			(id) => !newGroupIds.includes(id)
		);

		if (groupsToDelete.length > 0) {
			await GroupModel.deleteMany({ id: { $in: groupsToDelete } });
		}

		console.log('groups', groups);

		// Update or create groups in MongoDB with positions
		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];

			const existingGroup = await GroupModel.findOne({ id: group.id });

			if (existingGroup) {
				// Update existing group
				await repo.updateGroup(group.id, {
					title: group.title,
					color: group.color,
					tasks: group.tasks.map(transformTask),
					position: group.position, // Update position based on array index
				});
			} else {
				console.log('group 123123', group);
				// Create new group
				const newGroup = {
					id: group.id,
					title: group.title,
					color: group.color,
					tasks: group.tasks.map(transformTask),
					position: group.position, // Set position based on array index
				};

				console.log('newGroup', newGroup);
				const createdGroup = await GroupModel.create(newGroup);
				console.log('createdGroup', createdGroup);
			}
		}

		return NextResponse.json({
			success: true,
			message: 'Database synchronized successfully',
		});
	} catch (error) {
		console.error('Error syncing database:', error);
		return NextResponse.json(
			{ error: 'Failed to sync database' },
			{ status: 500 }
		);
	}
}
