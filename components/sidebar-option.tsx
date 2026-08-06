'use client';

import * as React from 'react';
import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { usePathname } from 'next/navigation';

interface SidebarOptionProps {
	href: string;
	id: string;
}

const SidebarOption = ({ href, id }: SidebarOptionProps) => {
	const [data, loading, error] = useDocumentData(doc(db, 'documents', id));
	const pathname = usePathname();
	const isActive = href.includes(pathname) && pathname !== '/';

	if (!data) return null;

	return (
		<Link
			href={href}
			className={`border p-2 rounded-md ${isActive ? 'bg-gray-200 font-bold border-black' : 'border-gray-400'}`}
		>
			<p className="truncate">{data.title}</p>
		</Link>
	);
};

export default SidebarOption;
