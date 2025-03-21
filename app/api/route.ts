import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';

const filePath = 'db.json';

async function readDB() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB:', error);
    return { tasks: [] };
  }
}

async function writeDB(data: any) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing DB:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  const { action, payload } = await request.json();
  let db = await readDB();

  switch (action) {
    case 'addTask': {
      // Payload: { groupId: string, task: { id: string, name: string, ... } }
      const { groupId, task } = payload;
      db.tasks.find((group: any) => group.id === groupId)?.tasks.push(task);
      break;
    }
    case 'addGroup': {
      // Payload: { group: { id: string, title: string, color: string } }
      db.tasks.push(payload.group);
      break;
    }
    case 'updateTask': {
      // Payload: { groupId: string, task: { id: string, name: string, ... } }
      const { groupId, task: updatedTask } = payload;
      const group = db.tasks.find((group: any) => group.id === groupId);
      if (group) {
        const taskIndex = group.tasks.findIndex((task: any) => task.id === updatedTask.id);
        if (taskIndex !== -1) {
          group.tasks[taskIndex] = updatedTask;
        }
      }
      break;
    }
    case 'deleteTask': {
      // Payload: { groupId: string, taskId: string }
      const { groupId, taskId } = payload;
      const group = db.tasks.find((group: any) => group.id === groupId);
      if (group) {
        group.tasks = group.tasks.filter((task: any) => task.id !== taskId);
      }
      break;
    }
    case 'addContent': {
      // Payload: { groupId: string, taskId: string, content: { text: string, timestamp: string, author: string } }
      const { groupId, taskId, content } = payload;
      const targetTask = db.tasks.find((group: any) => group.id === groupId)?.tasks.find((task: any) => task.id === taskId);
      if (targetTask) {
        targetTask.contentList = targetTask.contentList || [];
        targetTask.contentList.push(content);
      }
      break;
    }
    case 'addSubtask': {
      // Payload: { groupId: string, taskId: string, subtask: { id: string, name: string, ... } }
      const { groupId, taskId, subtask } = payload;
      const targetTask = db.tasks.find((group: any) => group.id === groupId)?.tasks.find((task: any) => task.id === taskId);
      if (targetTask) {
        targetTask.subtasks = targetTask.subtasks || [];
        targetTask.subtasks.push(subtask);
      }
      break;
    }
    case 'updateSubtask': {
      // Payload: { groupId: string, taskId: string, subtask: { id: string, name: string, ... } }
      const { groupId, taskId, subtask: updatedSubtask } = payload;
      const task = db.tasks.find((group: any) => group.id === groupId)?.tasks.find((task: any) => task.id === taskId);

      if (task && task.subtasks) {
        const subtaskIndex = task.subtasks.findIndex((subtask: any) => subtask.id === updatedSubtask.id);
        if (subtaskIndex !== -1) {
          task.subtasks[subtaskIndex] = updatedSubtask;
        }
      }
      break;
    }
    case 'deleteSubtask': {
      // Payload: { groupId: string, taskId: string, subtaskId: string }
      const { groupId, taskId, subtaskId } = payload;
      const task = db.tasks.find((group: any) => group.id === groupId)?.tasks.find((task: any) => task.id === taskId);
      if (task) {
        task.subtasks = task.subtasks.filter((subtask: any) => subtask.id !== subtaskId);
      }
      break;
    }
    default:
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }

  await writeDB(db);
  return NextResponse.json({ message: 'OK' });
}


export async function GET() {
  const db = await readDB();
  return NextResponse.json(db);
}
