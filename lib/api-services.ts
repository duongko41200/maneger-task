import type { Group, Task, Subtask } from './types';

const API_BASE_URL = '/api';

// Groups API
export const groupApi = {
	getAll: async (): Promise<Group[]> => {
		const response = await fetch(`${API_BASE_URL}/groups`);
		if (!response.ok) throw new Error('Failed to fetch groups');
		return response.json();
	},

	create: async (group: Omit<Group, 'id'>): Promise<string> => {
		const response = await fetch(`${API_BASE_URL}/groups`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(group),
		});
		if (!response.ok) throw new Error('Failed to create group');
		const data = await response.json();
		return data.id;
	},

	update: async (
		groupId: string,
		updates: Partial<Group>
	): Promise<void> => {
		const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updates),
		});
		if (!response.ok) throw new Error('Failed to update group');
	},

	delete: async (groupId: string): Promise<void> => {
		const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
			method: 'DELETE',
		});
		if (!response.ok) throw new Error('Failed to delete group');
	},

	sync: async (groups: Group[]): Promise<void> => {
		const response = await fetch(`${API_BASE_URL}/groups/sync`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(groups),
		});
		if (!response.ok)
			throw new Error('Failed to sync groups with database');
	},
};

// Tasks API
export const taskApi = {
	create: async (
		groupId: string,
		task: Omit<Task, 'id'>
	): Promise<string> => {
		const response = await fetch(
			`${API_BASE_URL}/groups/${groupId}/tasks`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(task),
			}
		);
		if (!response.ok) throw new Error('Failed to create task');
		const data = await response.json();
		return data.id;
	},

	update: async (
		groupId: string,
		taskId: string,
		updates: Partial<Task>
	): Promise<void> => {
		const response = await fetch(
			`${API_BASE_URL}/groups/${groupId}/tasks`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId, updates }),
			}
		);
		if (!response.ok) throw new Error('Failed to update task');
	},

	delete: async (groupId: string, taskId: string): Promise<void> => {
		const response = await fetch(
			`${API_BASE_URL}/groups/${groupId}/tasks`,
			{
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId }),
			}
		);
		if (!response.ok) throw new Error('Failed to delete task');
	},
};

// Subtasks and Content API
export const subtaskApi = {
	addContent: async (
		groupId: string,
		taskId: string,
		content: string
	): Promise<void> => {
		const response = await fetch(
			`${API_BASE_URL}/groups/${groupId}/tasks/${taskId}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content }),
			}
		);
		if (!response.ok) throw new Error('Failed to add content');
	},

	create: async (
		groupId: string,
		taskId: string,
		subtask: Omit<Subtask, 'id'>
	): Promise<string> => {
		const response = await fetch(
			`${API_BASE_URL}/groups/${groupId}/tasks/${taskId}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subtask }),
			}
		);
		if (!response.ok) throw new Error('Failed to create subtask');
		const data = await response.json();
		return data.id;
	},

	update: async (
		groupId: string,
		taskId: string,
		subtaskId: string,
		updates: Partial<Subtask>
	): Promise<void> => {
		const response = await fetch(
			`${API_BASE_URL}/groups/${groupId}/tasks/${taskId}/subtasks/${subtaskId}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates),
			}
		);
		if (!response.ok) throw new Error('Failed to update subtask');
	},

	delete: async (
		groupId: string,
		taskId: string,
		subtaskId: string
	): Promise<void> => {
		const response = await fetch(
			`${API_BASE_URL}/groups/${groupId}/tasks/${taskId}/subtasks/${subtaskId}`,
			{
				method: 'DELETE',
			}
		);
		if (!response.ok) throw new Error('Failed to delete subtask');
	},

	move: async (
		groupId: string,
		sourceTaskId: string,
		subtaskId: string,
		targetTaskId: string
	): Promise<void> => {
		const response = await fetch(
			`${API_BASE_URL}/groups/${groupId}/tasks/${sourceTaskId}/subtasks/${subtaskId}`,
			{
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetTaskId }),
			}
		);
		if (!response.ok) throw new Error('Failed to move subtask');
	},
};
