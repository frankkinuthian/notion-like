'use client';

import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

const Header = () => {
	const { user, isSignedIn } = useUser();

	return (
		<div className="flex justify-between items-center p-5">
			{user && <h1 className="text-2xl">{user?.firstName}&apos;s Space</h1>}

			{/* Breadcrumbs */}
			<div>{isSignedIn ? <UserButton /> : <SignInButton />}</div>
		</div>
	);
};

export default Header;
