import { db } from './firebaseConfig';
import {
	collection,
	doc,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	getDoc,
} from 'firebase/firestore';
import type { Group, Task } from './types';

// Get all groups
export const getGroups = async (): Promise<Group[]> => {
	const querySnapshot = await getDocs(collection(db, 'groups'));
	return querySnapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as Group[];
};

// Add a new group
export const addGroup = async (
	group: Omit<Group, 'id'>
): Promise<string> => {
	const docRef = await addDoc(collection(db, 'groups'), group);
	return docRef.id;
};

// Update a group
export const updateGroup = async (
	groupId: string,
	updates: Partial<Group>
): Promise<void> => {
	const groupRef = doc(db, 'groups', groupId);
	await updateDoc(groupRef, updates);
};

// Delete a group
export const deleteGroup = async (groupId: string): Promise<void> => {
	const groupRef = doc(db, 'groups', groupId);
	await deleteDoc(groupRef);
};

// Add a task to a group
export const addTaskToGroup = async (
	groupId: string,
	task: Omit<Task, 'id'>
): Promise<string> => {
	const groupRef = doc(db, 'groups', groupId);
	const groupDoc = await getDoc(groupRef);

	if (!groupDoc.exists()) {
		throw new Error('Group not found');
	}

	const group = groupDoc.data() as Group;
	const newTask = { ...task, id: crypto.randomUUID() };

	await updateDoc(groupRef, {
		tasks: [...(group.tasks || []), newTask],
	});

	return newTask.id;
};

// Update a task in a group
export const updateTaskInGroup = async (
	groupId: string,
	taskId: string,
	updates: Partial<Task>
): Promise<void> => {
	const groupRef = doc(db, 'groups', groupId);
	const groupDoc = await getDoc(groupRef);

	if (!groupDoc.exists()) {
		throw new Error('Group not found');
	}

	const group = groupDoc.data() as Group;
	const updatedTasks = group.tasks.map((task) =>
		task.id === taskId ? { ...task, ...updates } : task
	);

	await updateDoc(groupRef, { tasks: updatedTasks });
};

// Delete a task from a group
export const deleteTaskFromGroup = async (
	groupId: string,
	taskId: string
): Promise<void> => {
	const groupRef = doc(db, 'groups', groupId);
	const groupDoc = await getDoc(groupRef);

	if (!groupDoc.exists()) {
		throw new Error('Group not found');
	}

	const group = groupDoc.data() as Group;
	const updatedTasks = group.tasks.filter((task) => task.id !== taskId);

	await updateDoc(groupRef, { tasks: updatedTasks });
};

// Add content to a task
export const addContentToTask = async (
	groupId: string,
	taskId: string,
	content: { text: string; timestamp: string; author: string }
): Promise<void> => {
	const groupRef = doc(db, 'groups', groupId);
	const groupDoc = await getDoc(groupRef);

	if (!groupDoc.exists()) {
		throw new Error('Group not found');
	}

	const group = groupDoc.data() as Group;
	const updatedTasks = group.tasks.map((task) => {
		if (task.id === taskId) {
			return {
				...task,
				contentList: [...(task.contentList || []), content],
			};
		}
		return task;
	});

	await updateDoc(groupRef, { tasks: updatedTasks });
};

// Add a subtask to a task
export const addSubtaskToTask = async (
	groupId: string,
	taskId: string,
	subtask: Omit<Task, 'id'>
): Promise<string> => {
	const groupRef = doc(db, 'groups', groupId);
	const groupDoc = await getDoc(groupRef);

	if (!groupDoc.exists()) {
		throw new Error('Group not found');
	}

	const group = groupDoc.data() as Group;
	const newSubtask = { ...subtask, id: crypto.randomUUID() };

	const updatedTasks = group.tasks.map((task) => {
		if (task.id === taskId) {
			return {
				...task,
				subtasks: [...(task.subtasks || []), newSubtask],
			};
		}
		return task;
	});

	await updateDoc(groupRef, { tasks: updatedTasks });
	return newSubtask.id;
};

// Update a subtask
export const updateSubtask = async (
	groupId: string,
	taskId: string,
	subtaskId: string,
	updates: Partial<Task>
): Promise<void> => {
	const groupRef = doc(db, 'groups', groupId);
	const groupDoc = await getDoc(groupRef);

	if (!groupDoc.exists()) {
		throw new Error('Group not found');
	}

	const group = groupDoc.data() as Group;
	const updatedTasks = group.tasks.map((task) => {
		if (task.id === taskId && task.subtasks) {
			return {
				...task,
				subtasks: task.subtasks.map((subtask) =>
					subtask.id === subtaskId
						? { ...subtask, ...updates }
						: subtask
				),
			};
		}
		return task;
	});

	await updateDoc(groupRef, { tasks: updatedTasks });
};

// Delete a subtask
export const deleteSubtask = async (
	groupId: string,
	taskId: string,
	subtaskId: string
): Promise<void> => {
	const groupRef = doc(db, 'groups', groupId);
	const groupDoc = await getDoc(groupRef);

	if (!groupDoc.exists()) {
		throw new Error('Group not found');
	}

	const group = groupDoc.data() as Group;
	const updatedTasks = group.tasks.map((task) => {
		if (task.id === taskId && task.subtasks) {
			return {
				...task,
				subtasks: task.subtasks.filter(
					(subtask) => subtask.id !== subtaskId
				),
			};
		}
		return task;
	});

	await updateDoc(groupRef, { tasks: updatedTasks });
};
