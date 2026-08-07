'use client';

import { useMyPresence, useOthers } from '@liveblocks/react';
import * as React from 'react';
import FollowPointer from '../follow-pointer';

interface LiveCursorProviderProps {
	children: React.ReactNode;
}

const LiveCursorProvider = ({ children }: LiveCursorProviderProps) => {
	const [myPresence, updateMyPresence] = useMyPresence();
	const othersPresence = useOthers();

	const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		// Instead of e.pageX etc, use Math.floor because of scroll breaking behavioural issues
		const cursor = {
			x: Math.floor(e.pageX),
			y: Math.floor(e.pageY),
		};
		updateMyPresence({ cursor });
	};

	const handlePointerLeave = () => {
		updateMyPresence({ cursor: null });
	};

	return (
		<div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
			{/* Render the cursors for others */}
			{othersPresence
				.filter((other) => other.presence.cursor !== null)
				.map(({ connectionId, presence, info }) => (
					<FollowPointer key={connectionId} info={info} x={presence.cursor!.x} y={presence.cursor!.y} />
				))}
			{children}
		</div>
	);
};

export default LiveCursorProvider;
