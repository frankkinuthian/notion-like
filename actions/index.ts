'use server';

import { adminDb } from '@/firebase/admin';
import { auth } from '@clerk/nextjs/server';

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
