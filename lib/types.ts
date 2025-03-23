export interface Subtask {
	id: string;
	name: string;
	priority?: string;
	status?: string;
	startDate?: string;
	endDate?: string;
	owner?: string;
	contentList?: ContentEntry[];
	notes?: string;
	budget?: string;
	files?: string;
}

// Update the Task interface to include the new content entry type
export interface ContentEntry {
	text: string;
	timestamp: string;
	author?: string;
}

export interface Task {
	id: string;
	name: string;
	owner?: string;
	priority?: string;
	status?: string;
	startDate?: string;
	endDate?: string;
	notes?: string;
	budget?: string;
	files?: string;
	timeline?: boolean;
	count?: number;
	content?: string;
	contentList?: ContentEntry[]; // Update this to use the ContentEntry type
	subtasks?: Subtask[];
	parentTaskId?: string; // Add this field to reference the parent task
}

export interface Group {
	id: string;
	title: string;
	color: string;
	tasks: Task[];
	position: number;
}
