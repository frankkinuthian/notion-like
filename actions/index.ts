'use server';

import { adminDb } from '@/firebase/admin';
import liveblocks from '@/lib/liveblocks';
import { auth } from '@clerk/nextjs/server';
import { tryCatch } from '@/lib/helpers/tryCatch';

export async function createNewDocument() {
	const { sessionClaims } = await auth.protect();
	const email = sessionClaims?.email;

	if (!email) {
		console.error('Error creating document: no email on session claims');
		return { documentId: null };
	}

	// Create the document itself.
	const { data: docRef, error: documentError } = await tryCatch(
		adminDb.collection('documents').add({ title: 'New Doc' }),
	);

	if (documentError) {
		console.error('Error creating document:', documentError);
		return { documentId: null };
	}

	// Record the creator's ownership of the matching room.
	const { error: roomError } = await tryCatch(
		adminDb.collection('users').doc(email).collection('rooms').doc(docRef.id).set({
			userId: email,
			role: 'owner',
			createdAt: new Date(),
			roomId: docRef.id,
		}),
	);

	if (roomError) {
		console.error('Error creating room reference:', roomError);
		return { documentId: null };
	}

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

export async function inviteUserToDoc(roomId: string, email: string) {
	const { userId } = await auth.protect();
	if (!userId) return { success: false };

	// Grant the invitee editor access by writing a room reference under their
	// own user document, which is what the auth endpoint checks on connect.
	const { error } = await tryCatch(
		adminDb.collection('users').doc(email).collection('rooms').doc(roomId).set({
			userId: email,
			role: 'editor',
			createdAt: new Date(),
			roomId,
		}),
	);

	if (error) {
		console.error('Error inviting user to document:', error);
		return { success: false };
	}

	return { success: true };
}
