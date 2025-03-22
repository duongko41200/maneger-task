import type { Group } from '@/lib/types';

export const groupApi = {
	getAll: async (): Promise<Group[]> => {
		try {
			const response = await fetch('/api/groups');
			if (!response.ok) {
				throw new Error('Failed to fetch groups');
			}
			return response.json();
		} catch (error) {
			console.error('Error fetching groups:', error);
			throw error;
		}
	},

	delete: async (groupId: string): Promise<void> => {
		try {
			const response = await fetch(`/api/groups/${groupId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete group');
			}
		} catch (error) {
			console.error('Error deleting group:', error);
			throw error;
		}
	},

	update: async (
		groupId: string,
		updates: Partial<Group>
	): Promise<void> => {
		try {
			const response = await fetch(`/api/groups/${groupId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updates),
			});
			if (!response.ok) {
				throw new Error('Failed to update group');
			}
		} catch (error) {
			console.error('Error updating group:', error);
			throw error;
		}
	},

	sync: async (groups: Group[]): Promise<void> => {
		try {
			const response = await fetch('/api/groups/sync', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(groups),
			});
			if (!response.ok) {
				throw new Error('Failed to sync groups');
			}
		} catch (error) {
			console.error('Error syncing groups:', error);
			throw error;
		}
	},
};
