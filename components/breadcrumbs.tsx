'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const Breadcrumbs = () => {
	const pathname = usePathname();

	const segments = pathname.split('/');
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/">Home</BreadcrumbLink>
				</BreadcrumbItem>

				{segments.map((segment, _) => {
					if (!segment) return null;

					const href = `/${segments.slice(0, _ + 1).join('/')}`;
					const last = _ === segments.length - 1;

					return (
						<React.Fragment key={segment}>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{last ? (
									<BreadcrumbPage>{segment}</BreadcrumbPage>
								) : (
									<BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
};

export default Breadcrumbs;
