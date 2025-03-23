'use client';

import React, {
	createContext,
	useContext,
	useReducer,
	useEffect,
	useState,
} from 'react';
import type { Group, Task, Subtask } from '@/lib/types';
import { groupApi, taskApi, subtaskApi } from '@/lib/api-services';
import { toast } from '@/components/ui/use-toast';

// Define action types
type ActionType =
	| { type: 'SET_GROUPS'; payload: Group[] }
	| { type: 'ADD_GROUP'; payload: Group }
	| {
			type: 'REORDER_GROUPS';
			payload: { sourceIndex: number; targetIndex: number };
	  }
	| {
			type: 'UPDATE_GROUP';
			payload: { groupId: string; updates: Partial<Group> };
	  }
	| { type: 'DELETE_GROUP'; payload: string }
	| { type: 'ADD_TASK'; payload: { groupId: string; task: Task } }
	| {
			type: 'UPDATE_TASK';
			payload: {
				groupId: string;
				taskId: string;
				updates: Partial<Task>;
			};
	  }
	| {
			type: 'DELETE_TASK';
			payload: { groupId: string; taskId: string };
	  }
	| {
			type: 'MOVE_TASK';
			payload: {
				sourceGroupId: string;
				targetGroupId: string;
				taskId: string;
				task: Task;
			};
	  }
	| {
			type: 'ADD_CONTENT';
			payload: any;
	  }
	| {
			type: 'ADD_SUBTASK';
			payload: { groupId: string; taskId: string; subtask: Subtask };
	  }
	| {
			type: 'UPDATE_SUBTASK';
			payload: {
				groupId: string;
				taskId: string;
				subtaskId: string;
				updates: Partial<Subtask>;
			};
	  }
	| {
			type: 'DELETE_SUBTASK';
			payload: { groupId: string; taskId: string; subtaskId: string };
	  }
	| {
			type: 'MOVE_SUBTASK';
			payload: {
				groupId: string;
				sourceTaskId: string;
				targetTaskId: string;
				subtaskId: string;
				subtask: Subtask;
			};
	  };

// Define the context type
type GroupContextType = {
	groups: Group[];
	dispatch: React.Dispatch<ActionType>;
	syncData: () => Promise<void>;
	deleteGroup: (groupId: string) => Promise<void>;
	updateGroup: (
		groupId: string,
		updates: Partial<Group>
	) => Promise<void>;
	deleteSubtask: (
		groupId: string,
		taskId: string,
		subtaskId: string
	) => Promise<void>;
	updateSubtask: (
		groupId: string,
		taskId: string,
		subtaskId: string,
		updates: Partial<Subtask>
	) => Promise<void>;
	moveSubtask: (
		groupId: string,
		sourceTaskId: string,
		subtaskId: string,
		targetTaskId: string
	) => Promise<void>;
	isLoading: boolean;
};

// Create the context
const GroupContext = createContext<GroupContextType | undefined>(
	undefined
);

// Reducer function
function groupReducer(state: Group[], action: ActionType): Group[] {
	switch (action.type) {
		case 'SET_GROUPS':
			return action.payload;

		case 'ADD_GROUP':
			return [...state, action.payload];

		case 'REORDER_GROUPS': {
			const { sourceIndex, targetIndex } = action.payload;
			const newGroups = [...state];
			const [movedGroup] = newGroups.splice(sourceIndex, 1);
			newGroups.splice(targetIndex, 0, movedGroup);
			return newGroups;
		}

		case 'UPDATE_GROUP':
			return state.map((group) =>
				group.id === action.payload.groupId
					? { ...group, ...action.payload.updates }
					: group
			);

		case 'DELETE_GROUP':
			return state.filter((group) => group.id !== action.payload);

		case 'ADD_TASK':
			return state.map((group) =>
				group.id === action.payload.groupId
					? { ...group, tasks: [...group.tasks, action.payload.task] }
					: group
			);

		case 'UPDATE_TASK':
			return state.map((group) => ({
				...group,
				tasks: group.tasks.map((task) =>
					task.id === action.payload.taskId
						? { ...task, ...action.payload.updates }
						: task
				),
			}));

		case 'DELETE_TASK':
			return state.map((group) => ({
				...group,
				tasks: group.tasks.filter(
					(task) => task.id !== action.payload.taskId
				),
			}));

		case 'MOVE_TASK':
			return state.map((group) => {
				if (group.id === action.payload.sourceGroupId) {
					return {
						...group,
						tasks: group.tasks.filter(
							(task) => task.id !== action.payload.taskId
						),
					};
				}
				if (group.id === action.payload.targetGroupId) {
					return {
						...group,
						tasks: [...group.tasks, action.payload.task],
					};
				}
				return group;
			});

		case 'ADD_CONTENT':
			console.log('action.state', state);
			console.log('action.payload.content', action.payload);
			return state.map((group) => {
				if (group.id === action.payload.groupId) {
					return {
						...group,
						tasks: group.tasks.map((task) => {
							if (task.id === action.payload.taskId) {
								return {
									...task,
									subtasks: task?.subtasks?.map((subtask) => {
										if (subtask.id === action.payload.subtaskId) {
											return {
												...subtask,
												contentList: [
													...(subtask.contentList || []),
													action.payload.content,
												],
											};
										}
										return subtask;
									}),
								};
							}
							return task;
						}),
					};
				}
				return group;
			});

		case 'ADD_SUBTASK':
			return state.map((group) => ({
				...group,
				tasks: group.tasks.map((task) =>
					task.id === action.payload.taskId
						? {
								...task,
								subtasks: [
									...(task.subtasks || []),
									action.payload.subtask,
								],
						  }
						: task
				),
			}));

		case 'UPDATE_SUBTASK':
			return state.map((group) => ({
				...group,
				tasks: group.tasks.map((task) =>
					task.id === action.payload.taskId && task.subtasks
						? {
								...task,
								subtasks: task.subtasks.map((subtask) =>
									subtask.id === action.payload.subtaskId
										? { ...subtask, ...action.payload.updates }
										: subtask
								),
						  }
						: task
				),
			}));

		case 'DELETE_SUBTASK':
			return state.map((group) => ({
				...group,
				tasks: group.tasks.map((task) =>
					task.id === action.payload.taskId && task.subtasks
						? {
								...task,
								subtasks: task.subtasks.filter(
									(subtask) => subtask.id !== action.payload.subtaskId
								),
						  }
						: task
				),
			}));

		case 'MOVE_SUBTASK':
			return state.map((group) => ({
				...group,
				tasks: group.tasks.map((task) => {
					if (task.id === action.payload.sourceTaskId) {
						return {
							...task,
							subtasks:
								task.subtasks?.filter(
									(subtask) => subtask.id !== action.payload.subtaskId
								) || [],
						};
					}
					if (task.id === action.payload.targetTaskId) {
						return {
							...task,
							subtasks: [
								...(task.subtasks || []),
								action.payload.subtask,
							],
						};
					}
					return task;
				}),
			}));

		default:
			return state;
	}
}

// Provider component
export function GroupProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [groups, dispatch] = useReducer(groupReducer, []);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchGroups = async () => {
			setIsLoading(true);
			try {
				const data = await groupApi.getAll();
				dispatch({ type: 'SET_GROUPS', payload: data });
			} catch (error) {
				console.error('Error fetching groups:', error);
				toast({
					title: 'Error',
					description: 'Failed to fetch groups. Please try again.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchGroups();
	}, []);

	const syncData = async () => {
		setIsLoading(true);
		try {
			await groupApi.sync(groups);
			const data = await groupApi.getAll();
			dispatch({ type: 'SET_GROUPS', payload: data });
			toast({
				title: 'Data synced',
				description:
					'All data has been synchronized successfully with the database.',
			});
		} catch (error) {
			console.error('Error syncing data:', error);
			toast({
				title: 'Error',
				description: 'Failed to sync data. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const deleteGroup = async (groupId: string) => {
		setIsLoading(true);
		try {
			await groupApi.delete(groupId);
			dispatch({ type: 'DELETE_GROUP', payload: groupId });
			toast({
				title: 'Group deleted',
				description: 'Group has been deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting group:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete group. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const updateGroup = async (
		groupId: string,
		updates: Partial<Group>
	) => {
		setIsLoading(true);
		try {
			await groupApi.update(groupId, updates);
			dispatch({ type: 'UPDATE_GROUP', payload: { groupId, updates } });
			toast({
				title: 'Group updated',
				description: 'Group has been updated successfully.',
			});
		} catch (error) {
			console.error('Error updating group:', error);
			toast({
				title: 'Error',
				description: 'Failed to update group. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const deleteSubtask = async (
		groupId: string,
		taskId: string,
		subtaskId: string
	) => {
		setIsLoading(true);
		try {
			await subtaskApi.delete(groupId, taskId, subtaskId);
			dispatch({
				type: 'DELETE_SUBTASK',
				payload: { groupId, taskId, subtaskId },
			});
			toast({
				title: 'Subtask deleted',
				description: 'Subtask has been deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting subtask:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete subtask. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const updateSubtask = async (
		groupId: string,
		taskId: string,
		subtaskId: string,
		updates: Partial<Subtask>
	) => {
		setIsLoading(true);
		try {
			await subtaskApi.update(groupId, taskId, subtaskId, updates);
			dispatch({
				type: 'UPDATE_SUBTASK',
				payload: { groupId, taskId, subtaskId, updates },
			});
			toast({
				title: 'Subtask updated',
				description: 'Subtask has been updated successfully.',
			});
		} catch (error) {
			console.error('Error updating subtask:', error);
			toast({
				title: 'Error',
				description: 'Failed to update subtask. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const moveSubtask = async (
		groupId: string,
		sourceTaskId: string,
		subtaskId: string,
		targetTaskId: string
	) => {
		setIsLoading(true);
		try {
			const sourceTask = groups
				.find((g) => g.id === groupId)
				?.tasks.find((t) => t.id === sourceTaskId);
			const subtask = sourceTask?.subtasks?.find(
				(s) => s.id === subtaskId
			);

			if (!subtask) {
				throw new Error('Subtask not found');
			}

			await subtaskApi.move(
				groupId,
				sourceTaskId,
				subtaskId,
				targetTaskId
			);
			dispatch({
				type: 'MOVE_SUBTASK',
				payload: {
					groupId,
					sourceTaskId,
					targetTaskId,
					subtaskId,
					subtask,
				},
			});
			toast({
				title: 'Subtask moved',
				description: 'Subtask has been moved successfully.',
			});
		} catch (error) {
			console.error('Error moving subtask:', error);
			toast({
				title: 'Error',
				description: 'Failed to move subtask. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<GroupContext.Provider
			value={{
				groups,
				dispatch,
				syncData,
				deleteGroup,
				updateGroup,
				deleteSubtask,
				updateSubtask,
				moveSubtask,
				isLoading,
			}}
		>
			{children}
		</GroupContext.Provider>
	);
}

// Custom hook
export function useGroups() {
	const context = useContext(GroupContext);
	if (context === undefined) {
		throw new Error('useGroups must be used within a GroupProvider');
	}
	return context;
}
