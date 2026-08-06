'use client';

import * as React from 'react';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import NewDocumentButton from './new-document-button';
import { MenuIcon } from 'lucide-react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useUser } from '@clerk/nextjs';
import { collectionGroup, where, query, DocumentData, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import SidebarOption from './sidebar-option';

interface RoomDocument extends DocumentData {
	// Written as `new Date()` by the server action, so it comes back as a Timestamp.
	createdAt: Timestamp;
	role: 'owner' | 'editor';
	roomId: string;
	userId: string;
}

type GroupedRoom = RoomDocument & { id: string };

const Sidebar = () => {
	const { user } = useUser();

	const [groupedData, setGroupedData] = React.useState<{
		owner: GroupedRoom[];
		editor: GroupedRoom[];
	}>({
		owner: [],
		editor: [],
	});

	const [data, loading, error] = useCollection(
		user && query(collectionGroup(db, 'rooms'), where('userId', '==', user.emailAddresses[0].toString())),
	);

	React.useEffect(() => {
		if (!data) return;

		const grouped = data.docs.reduce<{ owner: GroupedRoom[]; editor: GroupedRoom[] }>(
			(acc, curr) => {
				const roomData = curr.data() as RoomDocument;

				if (roomData.role === 'owner') {
					acc.owner.push({
						id: curr.id,
						...roomData,
					});
				} else {
					acc.editor.push({
						id: curr.id,
						...roomData,
					});
				}

				return acc;
			},
			{
				owner: [],
				editor: [],
			},
		);

		setGroupedData(grouped);
	}, [data]);

	const menuOptions = (
		<>
			<NewDocumentButton />

			{/* Surface read failures instead of silently falling through to  empty state. */}
			{error && <p className="text-sm text-red-600">Failed to load documents: {error.message}</p>}

			{/* My Documents */}
			<div className="flex py-4 flex-col space-y-4 md:max-w-36">
				{loading ? (
					<p className="text-sm text-gray-500">Loading documents...</p>
				) : groupedData.owner.length === 0 ? (
					<h2>No Documents found!</h2>
				) : (
					<>
						<h2 className="text-gray-500 font-semibold text-sm">My Documents</h2>

						{groupedData.owner.map((doc) => (
							<SidebarOption key={doc.id} id={doc.id} href={`/doc/${doc.id}`} />
						))}
					</>
				)}
			</div>
			{/* List.... */}

			{/* Shared with me */}
			{/* List... */}
		</>
	);

	return (
		<div className="p-2 md:p-5 bg-gray-200 relative">
			<div className="md:hidden">
				<Sheet>
					<SheetTrigger>
						<MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40} />
					</SheetTrigger>
					<SheetContent side="left">
						<SheetHeader>
							<SheetTitle>Menu</SheetTitle>
							<div>{menuOptions}</div>
						</SheetHeader>
					</SheetContent>
				</Sheet>
			</div>

			<div className="hidden md:inline">{menuOptions}</div>
		</div>
	);
};

export default Sidebar;
