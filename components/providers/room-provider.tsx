import * as React from 'react';
import { ClientSideSuspense, RoomProvider as RoomProviderWrapper } from '@liveblocks/react/suspense';
import LoadingSpinner from '../loading-spinner';
import LiveCursorProvider from './live-cursor-provider';

interface LiveBlocksRoomProviderProps {
	roomId: string;
	children: React.ReactNode;
}

const LiveBlocksRoomProvider = ({ roomId, children }: LiveBlocksRoomProviderProps) => {
	return (
		<RoomProviderWrapper
			id={roomId}
			initialPresence={{
				cursor: null,
			}}
		>
			<ClientSideSuspense fallback={<LoadingSpinner />}>
				<LiveCursorProvider>{children}</LiveCursorProvider>
			</ClientSideSuspense>
		</RoomProviderWrapper>
	);
};

export default LiveBlocksRoomProvider;
