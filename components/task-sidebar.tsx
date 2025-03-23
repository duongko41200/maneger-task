'use client';

import { useState, useEffect, useRef } from 'react';
import {
	X,
	Paperclip,
	Edit,
	Trash,
	Check,
	Bold,
	Italic,
	Underline,
	Link,
	List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Task, Subtask } from '@/lib/types';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import {
	MessageSquare,
	User,
	MoreHorizontal,
	SmilePlus,
} from 'lucide-react';

import { Separator } from '@/components/ui/separator';

// Add a formatDate function to format the timestamp
import {
	format,
	formatDistanceToNow,
	isToday,
	isYesterday,
} from 'date-fns';

import { useGroups } from '@/lib/contexts/GroupContext';

interface TaskSidebarProps {
	isOpen: boolean;
	task: Task | null;
	curentContentList: any;
	onClose: () => void;
	onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
	// onAddContent: (taskId: string, content: string) => void;
	onAddSubtask: (taskId: string, subtask: Subtask) => void;
	onUpdateSubtask: (
		taskId: string,
		subtaskId: string,
		updates: Partial<Subtask>
	) => void;
	onDeleteSubtask: (taskId: string, subtaskId: string) => void;
	groupId: string;
}

export default function TaskSidebar({
	isOpen,
	task,
	onClose,
	onUpdateTask,
	curentContentList,
	// onAddContent,
	onAddSubtask,
	onUpdateSubtask,
	onDeleteSubtask,
	groupId,
}: TaskSidebarProps) {
	const { groups, dispatch } = useGroups();

	const [content, setContent] = useState('');
	const [showAddSubtask, setShowAddSubtask] = useState(false);

	const [newSubtask, setNewSubtask] = useState<Partial<Subtask>>({
		name: '',
		priority: '',
		status: 'Not Started',
		startDate: '',
		endDate: '',
		owner: '',
	});

	// Add a new state for tracking which content item is being edited
	const [editingContentIndex, setEditingContentIndex] = useState<
		number | null
	>(null);
	const [editedContent, setEditedContent] = useState('');
	const contentEditableRef = useRef<HTMLDivElement>(null);

	// Add a function to handle editing content
	const handleEditContent = (index: number) => {
		const currentContent = groups
			?.find((group) => group.id === groupId)
			?.tasks?.find((t) => t.id === task?.parentTaskId)
			?.subtasks?.find((subtask) => subtask.id === task?.id)
			?.contentList?.[index];

		if (currentContent) {
			setEditingContentIndex(index);
			setEditedContent(currentContent.text);
		}
	};

	// Add a function to save edited content
	const handleSaveEditedContent = () => {
		if (
			task?.parentTaskId &&
			editingContentIndex !== null &&
			editedContent.trim()
		) {
			const updatedTask = groups
				?.find((group) => group.id === groupId)
				?.tasks?.find((t) => t.id === task.parentTaskId);

			if (updatedTask?.subtasks) {
				const updatedSubtask = updatedTask.subtasks.find(
					(s) => s.id === task.id
				);
				if (updatedSubtask) {
					const newContentList = [
						...(updatedSubtask.contentList || []),
					];
					newContentList[editingContentIndex] = {
						text: editedContent,
						timestamp: new Date().toISOString(),
						author: task.owner || 'DP',
					};

					dispatch({
						type: 'UPDATE_TASK',
						payload: {
							groupId,
							taskId: task.parentTaskId,
							updates: {
								subtasks: updatedTask.subtasks.map((s) =>
									s.id === task.id
										? { ...s, contentList: newContentList }
										: s
								),
							},
						},
					});

					setEditingContentIndex(null);
					setEditedContent('');

					toast({
						title: 'Content updated',
						description: 'Content has been updated successfully.',
					});
				}
			}
		}
	};

	// Add a function to delete content
	const handleDeleteContent = (index: number) => {
		if (task?.parentTaskId) {
			const updatedTask = groups
				?.find((group) => group.id === groupId)
				?.tasks?.find((t) => t.id === task.parentTaskId);

			if (updatedTask?.subtasks) {
				const updatedSubtask = updatedTask.subtasks.find(
					(s) => s.id === task.id
				);
				if (updatedSubtask) {
					const newContentList = [
						...(updatedSubtask.contentList || []),
					];
					newContentList.splice(index, 1);

					dispatch({
						type: 'UPDATE_TASK',
						payload: {
							groupId,
							taskId: task.parentTaskId,
							updates: {
								subtasks: updatedTask.subtasks.map((s) =>
									s.id === task.id
										? { ...s, contentList: newContentList }
										: s
								),
							},
						},
					});

					toast({
						title: 'Content deleted',
						description: 'Content has been deleted successfully.',
					});
				}
			}
		}
	};

	useEffect(() => {
		setContent('');
		setShowAddSubtask(false);
		setEditingContentIndex(null);
		setEditedContent('');
		resetNewSubtask();
	}, [task]);

	const resetNewSubtask = () => {
		setNewSubtask({
			name: '',
			priority: '',
			status: 'Not Started',
			startDate: '',
			endDate: '',
			owner: '',
		});
	};

	const handleFormatClick = (command: string, value?: string) => {
		document.execCommand(command, false, value);
		if (command === 'insertUnorderedList') {
			// Ensure proper list formatting
			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				const list = range.commonAncestorContainer.parentElement;
				if (list && list.tagName === 'ul') {
					list.style.marginLeft = '20px';
				}
			}
		}
		contentEditableRef.current?.focus();
	};

	const handleSubmitContent = () => {
		if (!content.trim()) return;
		const author = localStorage.getItem('member_aptis_name');
		console.log('author', author);
		let formattedContent = content;

		// If content has multiple lines and doesn't already have bullet points,
		// add bullet points to each line
		if (content.includes('\n') && !content.includes('•')) {
			formattedContent = content
				.split('\n')
				.map((line, index) =>
					line.trim() ? `• ${line.trim()}` : line
				)
				.join('\n');
		}

		// Create a content entry with timestamp and formatted content
		const newContent = {
			id: nanoid(),
			text: formattedContent,
			timestamp: new Date().toISOString(),
			author: author || 'DP',
		};

		// Dispatch the ADD_CONTENT action to update global state
		dispatch({
			type: 'ADD_CONTENT',
			payload: {
				groupId,
				taskId: task?.parentTaskId,
				subtaskId: task?.id,
				content: newContent,
			},
		});

		console.log('groups abc', groups);

		// Clear the content input
		setContent('');

		toast({
			title: 'Content added',
			description: 'Your content has been saved successfully.',
		});

		if (contentEditableRef.current) {
			contentEditableRef.current.innerHTML = '';
		}
	};

	if (!isOpen || !task) return null;

	// Add this function to format the date
	const formatDate = (timestamp: string) => {
		// Check if timestamp is valid
		if (!timestamp || isNaN(new Date(timestamp).getTime())) {
			return format(new Date(), 'dd/mm/yyyy h:mm a');
		}

		const date = new Date(timestamp);

		try {
			if (isToday(date)) {
				return `Today at ${format(date, 'h:mm a')}`;
			} else if (isYesterday(date)) {
				return `Yesterday at ${format(date, 'h:mm a')}`;
			} else if (
				Date.now() - date.getTime() <
				7 * 24 * 60 * 60 * 1000
			) {
				// Less than a week ago
				return formatDistanceToNow(date, { addSuffix: true });
			} else {
				return format(date, 'MMM d, yyyy');
			}
		} catch (error) {
			console.error('Error formatting date:', error);
			return 'Invalid date';
		}
	};

	return (
		<div
			className={cn(
				'fixed inset-y-0 right-0 w-[500px] bg-white shadow-xl z-100 flex flex-col transition-transform duration-300 ease-in-out',
				isOpen ? 'translate-x-0' : 'translate-x-full'
			)}
		>
			<div className="flex flex-col border-b">
				<div className="flex items-center justify-between p-4">
					<div className="text-sm text-blue-600">{task.name}</div>
					<div className="flex items-center gap-2">
						<div className="flex -space-x-2">
							{task.owner && (
								<Avatar className="h-6 w-6 border-2 border-white">
									<AvatarFallback
										className={cn(
											'text-white text-xs',
											task.owner === 'DP'
												? 'bg-green-500'
												: 'bg-orange-500'
										)}
									>
										{task.owner}
									</AvatarFallback>
								</Avatar>
							)}
						</div>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="h-5 w-5" />
						</Button>
					</div>
				</div>

				<div className="px-4 pb-2">
					<h2 className="text-xl font-semibold flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mr-2 text-gray-500"
						>
							<rect width="18" height="18" x="3" y="3" rx="2" />
							<path d="M3 9h18" />
						</svg>
						{task.name} {task.startDate ? task.startDate : '4/3/2025'}
					</h2>
				</div>
			</div>

			<Tabs defaultValue="updates" className="flex-1 flex flex-col">
				<TabsList className="px-4 py-2 border-b">
					<TabsTrigger
						value="updates"
						className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
					>
						<div className="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mr-2"
							>
								<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
							</svg>
							Updates / 1
						</div>
					</TabsTrigger>
					<TabsTrigger
						value="files"
						className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
					>
						<div className="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mr-2"
							>
								<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
								<polyline points="14 2 14 8 20 8"></polyline>
							</svg>
							Files
						</div>
					</TabsTrigger>
					<TabsTrigger
						value="activity"
						className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
					>
						<div className="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mr-2"
							>
								<path d="M12 20v-6M6 20V10M18 20V4"></path>
							</svg>
							Activity Log
						</div>
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="updates"
					className="flex-1 p-0 overflow-auto flex flex-col"
				>
					<div className="flex-1 overflow-auto max-h-[calc(100vh-350px)] overflow-y-auto">
						{(() => {
							const contentList = groups
								?.find((group) => group.id === groupId)
								?.tasks?.find((t) => t.id === task?.parentTaskId)
								?.subtasks?.find(
									(subtask) => subtask.id === task?.id
								)?.contentList;

							return contentList && contentList.length > 0 ? (
								<div className="p-4 space-y-6">
									{contentList.map((item: any, index: number) => (
										<div key={index} className="relative group">
											{editingContentIndex === index ? (
												<>
													<TabsContent value="updates" className="mt-0">
														<div className="p-4">
															{/* Reply input */}
															<div className="flex items-start gap-3">
																<Avatar className="h-8 w-8 mr-3">
																	<AvatarFallback
																		className={cn(
																			'text-white',
																			item.author === 'DP'
																				? 'bg-green-500'
																				: 'bg-orange-500'
																		)}
																	>
																		{item.author}
																	</AvatarFallback>
																</Avatar>
																<div className="flex-1">
																	<div className="flex items-center justify-between">
																		<div className="flex items-center">
																			<span className="font-medium mr-2">
																				{item.author === 'DP'
																					? 'Duong Pham'
																					: 'Nguyen Minh'}
																			</span>
																			<span className="text-gray-500 text-sm">
																				{formatDate(item.timestamp)}
																			</span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</TabsContent>

													<div>
														<textarea
															className="w-full border rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
															rows={5}
															value={editedContent}
															onChange={(e) =>
																setEditedContent(e.target.value)
															}
														></textarea>
														<div className="flex justify-end space-x-2">
															<div className="flex items-center justify-between p-2 px-4 border-t bg-gray-50">
																{/* //skjfksdjfjdslk */}
																<div className="flex space-x-2 mb-2">
																	<button
																		onClick={() =>
																			handleFormatClick('bold')
																		}
																		className="p-1 hover:bg-gray-100 rounded"
																		title="Bold"
																	>
																		<Bold size={16} />
																	</button>
																	<button
																		onClick={() =>
																			handleFormatClick('italic')
																		}
																		className="p-1 hover:bg-gray-100 rounded"
																		title="Italic"
																	>
																		<Italic size={16} />
																	</button>
																	<button
																		onClick={() =>
																			handleFormatClick('underline')
																		}
																		className="p-1 hover:bg-gray-100 rounded"
																		title="Underline"
																	>
																		<Underline size={16} />
																	</button>
																	<button
																		onClick={() => {
																			const url = prompt('Enter URL:');
																			if (url)
																				handleFormatClick(
																					'createLink',
																					url
																				);
																		}}
																		className="p-1 hover:bg-gray-100 rounded"
																		title="Insert Link"
																	>
																		<Link size={16} />
																	</button>
																	<button
																		onClick={() =>
																			handleFormatClick(
																				'insertUnorderedList'
																			)
																		}
																		className="p-1 hover:bg-gray-100 rounded"
																		title="Bullet List"
																	>
																		<List size={16} />
																	</button>
																</div>
															</div>

															<div>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() =>
																		setEditingContentIndex(null)
																	}
																>
																	Cancel
																</Button>
																<Button
																	size="sm"
																	onClick={handleSaveEditedContent}
																>
																	<Check className="h-4 w-4 mr-1" />
																	Save Changes
																</Button>
															</div>
														</div>
													</div>
												</>
											) : (
												<div>
													<div className="flex items-start mb-2 ">
														<Avatar className="h-8 w-8 mr-3">
															<AvatarFallback
																className={cn(
																	'text-white',
																	item.author === 'DP'
																		? 'bg-green-500'
																		: 'bg-orange-500'
																)}
															>
																{item.author}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1">
															<div className="flex items-center justify-between">
																<div className="flex items-center">
																	<span className="font-medium mr-2">
																		{item.author === 'DP'
																			? 'Duong Pham'
																			: 'Nguyen Minh'}
																	</span>
																	<span className="text-gray-500 text-sm">
																		{formatDate(item.timestamp)}
																	</span>
																</div>
																<div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
																	<Button
																		size="icon"
																		variant="ghost"
																		className="h-7 w-7 text-gray-500 hover:text-blue-500"
																		onClick={() =>
																			handleEditContent(index)
																		}
																	>
																		<Edit className="h-4 w-4" />
																	</Button>
																	<Button
																		size="icon"
																		variant="ghost"
																		className="h-7 w-7 text-gray-500 hover:text-red-500"
																		onClick={() =>
																			handleDeleteContent(index)
																		}
																	>
																		<Trash className="h-4 w-4" />
																	</Button>
																</div>
															</div>
															<div className="mt-2 whitespace-pre-wrap">
																{item.text &&
																(item.text.includes('\n') ||
																	item.text.includes('•')) ? (
																	<div className="pl-5">
																		{item.text
																			.split('\n')
																			.map((line: any, i: number) => (
																				<div
																					key={i}
																					className={
																						line.trim().startsWith('•')
																							? 'flex'
																							: ''
																					}
																				>
																					{!line
																						.trim()
																						.startsWith('•') &&
																						line.trim() !== '' && (
																							<p className="mb-1">
																								{line}
																							</p>
																						)}
																					{line
																						.trim()
																						.startsWith('•') && (
																						<>
																							<span className="mr-2">
																								•
																							</span>
																							<p className="mb-1">
																								{line
																									.substring(1)
																									.trim()}
																							</p>
																						</>
																					)}
																				</div>
																			))}
																	</div>
																) : (
																    <p
      className="mb-1"
      dangerouslySetInnerHTML={{ __html: item.text }}
    />
																)}
															</div>
														</div>
													</div>
													<div className="flex items-center mt-2 ml-11 space-x-4">
														<Button
															variant="ghost"
															size="sm"
															className="text-gray-500 h-8"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="16"
																height="16"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
																className="mr-1"
															>
																<path d="M7 10v12"></path>
																<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
															</svg>
															Like
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-gray-500 h-8"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="16"
																height="16"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
																className="mr-1"
															>
																<path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
															</svg>
															Reply
														</Button>
													</div>
													{index <
														curentContentList?.contentList?.length -
															1 && <hr className="my-4" />}
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
									<div className="flex flex-col items-center mb-4">
										<div className="flex mb-4">
											<div className="bg-blue-100 p-2 rounded-lg mr-2">
												<div className="w-10 h-2 bg-blue-300 rounded mb-1"></div>
												<div className="w-8 h-2 bg-blue-300 rounded"></div>
											</div>
											<div className="bg-blue-100 p-2 rounded-lg">
												<div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center text-blue-500 text-xs">
													😊
												</div>
											</div>
										</div>
										<h3 className="text-lg font-medium mb-2">
											No updates yet
										</h3>
										<p className="text-gray-500 text-sm mb-4">
											Share progress, mention a teammate,
											<br />
											or upload a file to get things moving
										</p>
									</div>
								</div>
							);
						})()}
					</div>

					<div className="border-t mt-auto">
						<div className="p-4">
							<div className="flex flex-col space-y-4">
								<div
									ref={contentEditableRef}
									contentEditable
									className="min-h-[100px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
									onInput={(e) => setContent(e.currentTarget.innerHTML)}
									data-placeholder="Add a comment..."
									onClick={(e) => {
										const target = e.target as HTMLElement;
										if (target.tagName === 'A') {
											e.preventDefault();
											const href = target.getAttribute('href');
											if (href) {
												window.open(href, '_blank');
											}
										}
									}}
								/>

								<div className="flex justify-between">
									<div className="flex items-center justify-between p-2 px-4 border-t bg-gray-50">
										<div className="flex space-x-2 mb-2">
											<button
												onClick={() => handleFormatClick('bold')}
												className="p-1 hover:bg-gray-100 rounded"
												title="Bold"
											>
												<Bold size={16} />
											</button>
											<button
												onClick={() => handleFormatClick('italic')}
												className="p-1 hover:bg-gray-100 rounded"
												title="Italic"
											>
												<Italic size={16} />
											</button>
											<button
												onClick={() => handleFormatClick('underline')}
												className="p-1 hover:bg-gray-100 rounded"
												title="Underline"
											>
												<Underline size={16} />
											</button>
											<button
												onClick={() => {
													const url = prompt('Enter URL:');
													if (url) handleFormatClick('createLink', url);
												}}
												className="p-1 hover:bg-gray-100 rounded"
												title="Insert Link"
											>
												<Link size={16} />
											</button>
											<button
												onClick={() =>
													handleFormatClick('insertUnorderedList')
												}
												className="p-1 hover:bg-gray-100 rounded"
												title="Bullet List"
											>
												<List size={16} />
											</button>
										</div>
									</div>

									<div>
										<Button
											size="sm"
											onClick={handleSubmitContent}
											disabled={!content.trim()}
										>
											Send
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="files" className="flex-1 p-4">
					<div className="flex flex-col items-center justify-center h-full">
						<p className="text-gray-500">No files uploaded yet</p>
						<Button variant="outline" className="mt-4">
							<Paperclip className="h-4 w-4 mr-2" />
							Upload Files
						</Button>
					</div>
				</TabsContent>

				<TabsContent value="activity" className="flex-1 p-4">
					<div className="flex flex-col items-center justify-center h-full">
						<p className="text-gray-500">No activity recorded yet</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
