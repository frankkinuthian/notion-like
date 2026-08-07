import Link from 'next/link';
import { Button } from './ui/button';

/**
 * Maps a Liveblocks `ROOM_CONNECTION_ERROR` close code to a message
 * that is useful to a person rather than to a protocol.
 */
export function roomConnectionErrorMessage(code: number): string {
	switch (code) {
		case -1:
			return 'We could not verify your access to this document.';
		case 4001:
			return 'You do not have access to this document.';
		case 4005:
			return 'This document has reached its maximum number of collaborators.';
		case 4006:
			return 'This document has moved. Try opening it again from your list.';
		default:
			return 'We could not connect to this document.';
	}
}

const RoomError = ({ message }: { message: string }) => {
	return (
		<div role="alert" className="flex flex-col items-center justify-center gap-4 mt-10 text-center">
			<div>
				<h2 className="text-lg font-semibold text-gray-900">Cannot open this document</h2>
				<p className="mt-1 text-sm text-gray-600">{message}</p>
			</div>

			<Button asChild variant="outline">
				<Link href="/">Back to your documents</Link>
			</Button>
		</div>
	);
};

export default RoomError;
