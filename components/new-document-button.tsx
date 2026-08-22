'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createNewDocument } from '@/actions';

const NewDocumentButton = () => {
	const router = useRouter();
	const [isPending, startTransition] = React.useTransition();

	const handleCreateNewDocument = () => {
		startTransition(async () => {
			const { documentId } = await createNewDocument();

			if (!documentId) {
				toast.error('Failed to create a new document!');
				return;
			}

			router.push(`/doc/${documentId}`);
		});
	};

	return (
		<Button onClick={handleCreateNewDocument} disabled={isPending}>
			{isPending ? 'Creating...' : 'New Document'}
		</Button>
	);
};

export default NewDocumentButton;
