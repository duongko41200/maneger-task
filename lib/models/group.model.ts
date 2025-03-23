import mongoose, { Schema, Document } from 'mongoose';

export interface IContent {
	text: string;
	timestamp: string;
	author: string;
}

export interface ISubtask {
	id: string;
	name: string;
	owner?: string;
	priority?: string;
	status?: string;
	startDate?: string;
	endDate?: string;
	contentList?: IContent[];
}

export interface ITask {
	id: string;
	name: string;
	owner?: string;
	priority?: string;
	status?: string;
	startDate?: string;
	endDate?: string;
	count?: number;
	notes?: string;
	budget?: string;
	subtasks: ISubtask[];
	contentList: IContent[];
}

export interface IGroup extends Document {
	id: string;
	title: string;
	color: string;
	tasks: ITask[];
	position: number;
}

const ContentSchema = new Schema<IContent>({
	text: { type: String, required: true },
	timestamp: { type: String, required: true },
	author: { type: String, required: true },
});

const SubtaskSchema = new Schema<ISubtask>({
	id: { type: String, required: true },
	name: { type: String, required: true },
	owner: String,
	priority: String,
	status: String,
	startDate: String,
	endDate: String,
	contentList: [ContentSchema],
});

const TaskSchema = new Schema<ITask>({
	id: { type: String, required: true },
	name: { type: String, required: true },
	owner: String,
	priority: String,
	status: String,
	startDate: String,
	endDate: String,
	count: Number,
	notes: String,
	budget: String,
	subtasks: [SubtaskSchema],
	contentList: [ContentSchema],
});

const GroupSchema = new Schema<IGroup>({
	id: { type: String, required: true, unique: true },
	title: { type: String, required: true },
	color: { type: String, required: true },
	tasks: [TaskSchema],
	position: { type: Number, required: true, default: 0 },
});

export const Group =
	mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
