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

		console.log('groups', groups);

		// Update or create groups in MongoDB
		for (const group of groups) {
			const existingGroup = await GroupModel.findOne({ id: group.id });

			if (existingGroup) {
				// Update existing group
				await repo.updateGroup(group.id, {
					title: group.title,
					color: group.color,
					tasks: group.tasks.map(transformTask),
				});
			} else {
				// Create new group
				const newGroup = new GroupModel({
					id: group.id,
					title: group.title,
					color: group.color,
					tasks: group.tasks.map(transformTask),
				});
				await newGroup.save();
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
