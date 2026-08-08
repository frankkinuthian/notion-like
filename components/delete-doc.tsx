'use client';

import * as React from 'react';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteDocument } from '@/actions';

const DeleteDocument = () => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [isPending, startTransition] = React.useTransition();
	const pathname = usePathname();
	const router = useRouter();

	const handleDelete = async () => {
		const roomId = pathname.split('/').pop();

		if (!roomId) return;
		startTransition(async () => {
			const { success } = await deleteDocument(roomId);

			if (success) {
				setIsOpen(false);
				router.replace('/');

				toast.success('Document deleted successfully');
			} else {
				toast.error('Failed to delete document/ room!');
			}
		});
	};


	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<Button asChild variant={'destructive'}>
				<DialogTrigger>Delete</DialogTrigger>
			</Button>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure you want to delete this document?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently delete all of the <strong>content</strong> and remove{' '}
						<strong>users</strong> with access to this file.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button variant={'destructive'} onClick={handleDelete} disabled={isPending} type="button">
						{isPending ? 'Deleting...' : 'Delete'}
					</Button>

					<DialogClose asChild>
						<Button variant={'secondary'}>Cancel</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteDocument;
