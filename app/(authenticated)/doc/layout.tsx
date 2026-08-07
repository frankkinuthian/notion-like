import * as React from 'react';
import LiveBlocksProvider from '@/components/providers/live-blocks-provider';

const DocumentPagesLayout = ({ children }: { children: React.ReactNode }) => {
	return <LiveBlocksProvider>{children}</LiveBlocksProvider>;
};

export default DocumentPagesLayout;
