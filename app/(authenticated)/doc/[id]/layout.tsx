import { auth } from '@clerk/nextjs/server';
import LiveBlocksRoomProvider from '@/components/providers/room-provider';

const DocumentPageLayout = async ({ children, params }: LayoutProps<'/doc/[id]'>) => {
	const { userId } = await auth.protect();
	if (!userId) return null;

	const { id } = await params;

	return <LiveBlocksRoomProvider roomId={id}>{children}</LiveBlocksRoomProvider>;
};

export default DocumentPageLayout;
