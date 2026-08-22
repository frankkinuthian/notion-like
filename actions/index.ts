'use server';

import { adminDb } from '@/firebase/admin';
import liveblocks from '@/lib/liveblocks';
import { LiveblocksError } from '@liveblocks/node';
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

	// This spans two systems, so it can never be truly atomic. Instead it is
	// ordered to always be safe to retry.
	//
	// Liveblocks goes first because it is the step that cannot participate in a
	// Firestore batch. If it fails, nothing has been written yet and the whole
	// action can simply be run again.
	const { error: liveblocksError } = await tryCatch(liveblocks.deleteRoom(roomId));

	// A 404 means the room was already removed, most likely by an earlier run
	// that failed further down. Tolerating it is what makes a retry able to get
	// past this step instead of failing here forever.
	const roomAlreadyGone = liveblocksError instanceof LiveblocksError && liveblocksError.status === 404;

	if (liveblocksError && !roomAlreadyGone) {
		console.error('Error deleting Liveblocks room:', liveblocksError);
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

	// Delete the document and every reference to it in a single batch. Keeping
	// these together matters: the sidebar is driven by the room references, so
	// deleting the document on its own would leave a row in everyone's sidebar
	// pointing at a document that no longer exists.
	const batch = adminDb.batch();
	batch.delete(adminDb.collection('documents').doc(roomId));
	rooms.docs.forEach((doc) => batch.delete(doc.ref));

	const { error: batchError } = await tryCatch(batch.commit());

	if (batchError) {
		console.error('Error deleting document and room references:', batchError);
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

export async function removeUserFromDoc(roomId: string, email: string) {
	const { userId } = await auth.protect();
	if (!userId) return { success: false };

	// Revoke access by removing the room reference from under their own user
	// document, which is what the auth endpoint checks on connect.
	const { error } = await tryCatch(adminDb.collection('users').doc(email).collection('rooms').doc(roomId).delete());

	if (error) {
		console.error('Error removing user from document:', error);
		return { success: false };
	}

	return { success: true };
}
