'use client';

import * as React from 'react';
import { LiveblocksProvider } from '@liveblocks/react/suspense';

const LiveBlocksProvider = ({ children }: { children: React.ReactNode }) => {
	// env guard clause
	if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
		throw new Error('Missing NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY environment variable!');
	}

	return (
		<LiveblocksProvider throttle={16} authEndpoint={'/auth-endpoint'}>
			{children}
		</LiveblocksProvider>
	);
};

export default LiveBlocksProvider;
