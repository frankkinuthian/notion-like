'use client';

import * as React from 'react';
import { auth } from '@clerk/nextjs/server';

const DocumentPageLayout = async ({
	children,
	params: { id },
}: {
	children: React.ReactNode;
	params: {
		id: string;
	};
}) => {
	const { userId } = await auth.protect();
	return <div>{children}</div>;
};

export default DocumentPageLayout;
