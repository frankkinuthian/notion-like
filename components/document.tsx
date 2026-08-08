'use client';

import * as React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import Editor from './editor';

const Document = ({ id }: { id: string }) => {
	const [data, loading, error] = useDocumentData(doc(db, 'documents', id));
	const [input, setInput] = React.useState('');
	const [isUpdating, startTransition] = React.useTransition();

	// Load title on mount
	React.useEffect(() => {
		if (data) {
			setInput(data.title);
		}
	}, [data]);

	const updateTitle = (e: React.FormEvent) => {
		e.preventDefault();

		if (input.trim()) {
			startTransition(async () => {
				// update document
				await updateDoc(doc(db, 'documents', id), { title: input });
			});
		}
	};

	return (
		<div className="flex-1 h-full bg-white p-5">
			{/* Title */}
			<div className="flex max-w-6xl mx-auto justify-between pb-5">
				<form className="flex flex-1 space-x-2" onSubmit={updateTitle}>
					{/* update title stuff */}
					<Input value={input} onChange={(e) => setInput(e.target.value)} />

					<Button type="submit" disabled={isUpdating}>
						{isUpdating ? 'Updating...' : 'Update'}
					</Button>

					{/* If
					 * isOwner && InviteUser flow
					 * DeleteDocument
					 */}
				</form>
			</div>
			<div>
				{/* Manage Users */}

				{/* Avatars */}
			</div>

			<hr className="pb-10" />
			{/* Collaborative Editor */}
			<Editor />
		</div>
	);
};

export default Document;
