'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { createNewDocument } from '@/actions';

const NewDocumentButton = () => {
	const router = useRouter();
	const [isPending, startTransition] = React.useTransition();

	const handleCreateNewDocument = () => {
		startTransition(async () => {
			const { documentId } = await createNewDocument();

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
