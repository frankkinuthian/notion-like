'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { BlockNoteView } from '@blocknote/shadcn';
import { useCreateBlockNoteWithLiveblocks, useIsEditorReady } from '@liveblocks/react-blocknote';
import { useRoom } from '@liveblocks/react/suspense';
import { getYjsProviderForRoom } from '@liveblocks/yjs';
import LoadingSpinner from './loading-spinner';
import '@blocknote/shadcn/style.css';
import '@liveblocks/react-blocknote/styles.css';
import TranslateDocSummary from './translate-document-summary';

const Editor = () => {
	const [darkMode, setDarkMode] = React.useState(false);

	// Owns the Y.Doc, the Yjs provider and the awareness lifecycle internally.
	// Because it sets awareness up outside the render phase, it avoids the
	// presence write that Liveblocks' awareness performs, which is what caused
	// the "cannot update a component while rendering" error when wiring
	// @blocknote/core's collaboration extension up by hand.
	//
	// The collaborator name and cursor colour come from the `userInfo` set in
	// prepareSession() in app/api/auth-endpoint/route.ts.
	//
	// Uses the default "default" Y.Doc fragment rather than the
	// "document-store" fragment the hand-rolled setup wrote to, since that one
	// was written by @blocknote/core's own ySync implementation.
	const editor = useCreateBlockNoteWithLiveblocks({});

	// True once the Yjs provider reaches "synchronizing"/"synchronized".
	// BlockNote seeds the editor with a single empty paragraph before Yjs has
	// synced. Mounting BlockNoteView against that unsynced document means a
	// remote caret can arrive pointing at a position that does not exist yet,
	// which throws "RangeError: Position N out of range" as soon as a second
	// client joins the room.
	const isEditorReady = useIsEditorReady();

	// getYjsProviderForRoom caches providers in a WeakMap keyed by room, so this
	// returns the very provider the Liveblocks extension already created rather
	// than opening a second one that would double-apply updates.
	const room = useRoom();
	const doc = getYjsProviderForRoom(room).getYDoc();

	const style = `hover:text-white ${
		darkMode
			? 'text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700'
			: 'text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-700'
	}`;

	return (
		<div className="max-w-6xl mx-auto">
			<div className="flex items-center gap-2 justify-end mb-10">
				{/* Features */}
				{/* TranslateDoc - AI */}
				<TranslateDocSummary doc={doc} />
				{/* ChatToDocument - AI */}

				{/* Dark Mode toggle */}
				<Button
					className={style}
					onClick={() => setDarkMode(!darkMode)}
					aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{darkMode ? <SunIcon /> : <MoonIcon />}
				</Button>
			</div>

			{/* BlockNote */}
			<div className="relative max-w-6xl">
				{isEditorReady ? (
					<BlockNoteView editor={editor} className="min-h-screen" theme={darkMode ? 'dark' : 'light'} />
				) : (
					<LoadingSpinner />
				)}
			</div>
		</div>
	);
};

export default Editor;
