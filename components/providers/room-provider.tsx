'use client';

import * as React from 'react';
import { ClientSideSuspense, RoomProvider as RoomProviderWrapper, useErrorListener } from '@liveblocks/react/suspense';
import LoadingSpinner from '../loading-spinner';
import RoomError, { roomConnectionErrorMessage } from '../room-error';
import LiveCursorProvider from './live-cursor-provider';

interface LiveBlocksRoomProviderProps {
	roomId: string;
	children: React.ReactNode;
}

interface RoomConnectionFailure {
	roomId: string;
	message: string;
}

const LiveBlocksRoomProvider = ({ roomId, children }: LiveBlocksRoomProviderProps) => {
	const [failure, setFailure] = React.useState<RoomConnectionFailure | null>(null);

	// `useErrorListener` is scoped to the Liveblocks client, not to a single room,
	// so it fires for every room this client touches. We record the room the error
	// belongs to and only surface it when it matches the room we are rendering.
	useErrorListener((error) => {
		// Only connection failures should replace the document. Other errors
		// (thread/comment/notification failures) must not blank out the page.
		if (error.context.type !== 'ROOM_CONNECTION_ERROR') return;

		setFailure({
			roomId: error.context.roomId,
			message: roomConnectionErrorMessage(error.context.code),
		});
	});

	// Deriving this instead of clearing state in an effect means navigating to a
	// different document drops a stale error with no extra render pass.
	const activeFailure = failure?.roomId === roomId ? failure : null;

	return (
		<RoomProviderWrapper
			id={roomId}
			initialPresence={{
				cursor: null,
			}}
		>
			{activeFailure ? (
				<RoomError message={activeFailure.message} />
			) : (
				<ClientSideSuspense fallback={<LoadingSpinner />}>
					<LiveCursorProvider>{children}</LiveCursorProvider>
				</ClientSideSuspense>
			)}
		</RoomProviderWrapper>
	);
};

export default LiveBlocksRoomProvider;
