'use server';

import { adminDb } from '@/firebase/admin';
import liveblocks from '@/lib/liveblocks';
import { auth } from '@clerk/nextjs/server';
import { tryCatch } from '@/lib/helpers/tryCatch';

export async function createNewDocument() {
	const { userId, sessionClaims } = await auth.protect();

	const documentCollectionReference = adminDb.collection('documents');
	const docRef = await documentCollectionReference.add({
		title: 'New Doc',
	});

	await adminDb.collection('users').doc(sessionClaims?.email!).collection('rooms').doc(docRef.id).set({
		userId: sessionClaims?.email!,
		role: 'owner',
		createdAt: new Date(),
		roomId: docRef.id,
	});

	return { documentId: docRef.id };
}

export async function deleteDocument(roomId: string) {
	const { userId } = await auth.protect();
	if (!userId) return { success: false };

	// Delete the document itself.
	const { error: documentError } = await tryCatch(adminDb.collection('documents').doc(roomId).delete());

	if (documentError) {
		console.error('Error deleting document:', documentError);
		return { success: false };
	}

	// Find every user's room reference pointing at this room.
	const { data: rooms, error: roomsError } = await tryCatch(
		adminDb.collectionGroup('rooms').where('roomId', '==', roomId).get(),
	);

	if (roomsError) {
		console.error('Error querying room references:', roomsError);
		return { success: false };
	}

	// Remove them all in one batch.
	const batch = adminDb.batch();
	rooms.docs.forEach((doc) => batch.delete(doc.ref));

	const { error: batchError } = await tryCatch(batch.commit());

	if (batchError) {
		console.error('Error deleting room references:', batchError);
		return { success: false };
	}

	// Finally drop the Liveblocks room holding the collaborative content.
	const { error: liveblocksError } = await tryCatch(liveblocks.deleteRoom(roomId));

	if (liveblocksError) {
		console.error('Error deleting Liveblocks room:', liveblocksError);
		return { success: false };
	}

	return { success: true };
}
