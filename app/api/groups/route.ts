import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-config';
import { BaseRepository } from '@/lib/repositories/base.repo';

const repo = new BaseRepository();

export async function GET() {
	try {
		await connectDB();
		const groups = await repo.getGroups();
		return NextResponse.json(groups);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch groups' },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		const groupId = await repo.addGroup(body);
		return NextResponse.json({ id: groupId }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to create group' },
			{ status: 500 }
		);
	}
}
