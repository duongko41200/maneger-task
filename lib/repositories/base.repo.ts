import {
	Group,
	IGroup,
	ITask,
	ISubtask,
	IContent,
} from '../models/group.model';
import { v4 as uuidv4 } from 'uuid';
export class BaseRepository {
	// Get all groups
	async getGroups(): Promise<IGroup[]> {
		const group = await Group.find().sort({ position: 1 });
		console.log('group abc ', group);
		return group;
	}
	// Add a new group
	async addGroup(group: Omit<IGroup, 'id'>): Promise<string> {
		const newGroup = new Group({
			...group,
			id: uuidv4(),
			tasks: [],
		});
		await newGroup.save();
		return newGroup.id;
	}

	// Update a group
	async updateGroup(
		groupId: string,
		updates: Partial<IGroup>
	): Promise<void> {
		await Group.findOneAndUpdate({ id: groupId }, updates);
	}

	// Delete a group
	async deleteGroup(groupId: string): Promise<void> {
		await Group.findOneAndDelete({ id: groupId });
	}

	// Add a task to a group
	async addTaskToGroup(
		groupId: string,
		task: Omit<ITask, 'id'>
	): Promise<string> {
		const newTask = {
			...task,
			id: uuidv4(),
			subtasks: [],
			contentList: [],
		};

		await Group.findOneAndUpdate(
			{ id: groupId },
			{ $push: { tasks: newTask } }
		);

		return newTask.id;
	}

	// Update a task in a group
	async updateTaskInGroup(
		groupId: string,
		taskId: string,
		updates: Partial<ITask>
	): Promise<void> {
		await Group.findOneAndUpdate(
			{ id: groupId, 'tasks.id': taskId },
			{ $set: { 'tasks.$': { ...updates, id: taskId } } }
		);
	}

	// Delete a task from a group
	async deleteTaskFromGroup(
		groupId: string,
		taskId: string
	): Promise<void> {
		await Group.findOneAndUpdate(
			{ id: groupId },
			{ $pull: { tasks: { id: taskId } } }
		);
	}

	// Add content to a task
	async addContentToTask(
		groupId: string,
		taskId: string,
		content: IContent
	): Promise<void> {
		await Group.findOneAndUpdate(
			{ id: groupId, 'tasks.id': taskId },
			{ $push: { 'tasks.$.contentList': content } }
		);
	}

	// Add a subtask to a task
	async addSubtaskToTask(
		groupId: string,
		taskId: string,
		subtask: Omit<ISubtask, 'id'>
	): Promise<string> {
		const newSubtask = {
			...subtask,
			id: uuidv4(),
			contentList: [],
		};

		await Group.findOneAndUpdate(
			{ id: groupId, 'tasks.id': taskId },
			{ $push: { 'tasks.$.subtasks': newSubtask } }
		);

		return newSubtask.id;
	}

	// Update a subtask
	async updateSubtask(
		groupId: string,
		taskId: string,
		subtaskId: string,
		updates: Partial<ISubtask>
	): Promise<void> {
		await Group.findOneAndUpdate(
			{
				id: groupId,
				'tasks.id': taskId,
				'tasks.subtasks.id': subtaskId,
			},
			{
				$set: {
					'tasks.$[task].subtasks.$[subtask]': {
						...updates,
						id: subtaskId,
					},
				},
			},
			{
				arrayFilters: [
					{ 'task.id': taskId },
					{ 'subtask.id': subtaskId },
				],
			}
		);
	}

	// Delete a subtask
	async deleteSubtask(
		groupId: string,
		taskId: string,
		subtaskId: string
	): Promise<void> {
		await Group.findOneAndUpdate(
			{ id: groupId, 'tasks.id': taskId },
			{ $pull: { 'tasks.$.subtasks': { id: subtaskId } } }
		);
	}

	// Move a task between groups
	async moveTask(
		sourceGroupId: string,
		targetGroupId: string,
		taskId: string
	): Promise<void> {
		const sourceGroup = await Group.findOne({ id: sourceGroupId });
		const targetGroup = await Group.findOne({ id: targetGroupId });

		if (!sourceGroup || !targetGroup) {
			throw new Error('Source or target group not found');
		}

		const task = sourceGroup.tasks.find((t: any) => t.id === taskId);
		if (!task) {
			throw new Error('Task not found in source group');
		}

		// Remove task from source group
		await Group.findOneAndUpdate(
			{ id: sourceGroupId },
			{ $pull: { tasks: { id: taskId } } }
		);

		// Add task to target group
		await Group.findOneAndUpdate(
			{ id: targetGroupId },
			{ $push: { tasks: task } }
		);
	}
}
