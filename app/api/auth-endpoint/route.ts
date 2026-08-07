import { adminDb } from '@/firebase/admin';
import liveblocks from '@/lib/liveblocks';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	// ensure user is authenticated from clerk
	const { userId, sessionClaims } = await auth();

	if (!userId) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const { room } = await req.json();

	const session = liveblocks.prepareSession(sessionClaims?.email!, {
		userInfo: {
			name: sessionClaims?.fullName!,
			email: sessionClaims?.email!,
			avatar: sessionClaims?.image!,
		},
	});

	// Mirrors the write path in createNewDocument: users/{email}/rooms/{roomId}
	const userInRoom = await adminDb.collection('users').doc(sessionClaims?.email!).collection('rooms').doc(room).get();

	if (userInRoom.exists) {
		session.allow(room, session.FULL_ACCESS);

		const { body, status } = await session.authorize();

		return new Response(body, { status });
	} else {
		return NextResponse.json({ message: 'You are not in this room' }, { status: 403 });
	}
}
