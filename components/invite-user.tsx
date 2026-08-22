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
import { deleteDocument, inviteUserToDoc } from '@/actions';
import { Input } from './ui/input';

const InviteUser = () => {
	const [isOpen, setIsOpen] = React.useState(false);

	const [email, setEmail] = React.useState('');

	const [isPending, startTransition] = React.useTransition();
	const pathname = usePathname();
	const router = useRouter();

	const handeInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		const roomId = pathname.split('/').pop();
		if (!roomId) return;

		startTransition(async () => {
			const { success } = await inviteUserToDoc(roomId, email);

			if (success) {
				setIsOpen(false);
				setEmail('');

				toast.success('User added to room successfully');
			} else {
				toast.error('Failed to add user to the room!');
			}
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<Button asChild variant={'outline'}>
				<DialogTrigger>Invite</DialogTrigger>
			</Button>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite a user to collaborate!</DialogTitle>
					<DialogDescription>Enter the email of the user you want to invite...</DialogDescription>
				</DialogHeader>

				<form
					className="flex gap-2"
					onSubmit={handeInvite}
				>
					<Input
						type="email"
						placeholder="Enter the email..."
						className="w-full"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<Button type="submit" disabled={!email || isPending}>
						{isPending ? 'Inviting...' : 'Invite'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default InviteUser;
