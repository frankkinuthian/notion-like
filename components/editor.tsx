'use client';

import * as React from 'react';
import { useRoom, useSelf } from '@liveblocks/react/suspense';
import * as Y from 'yjs';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { Button } from './ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { BlockNoteView } from '@blocknote/shadcn';
import { BlockNoteEditor } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { withCollaboration } from '@blocknote/core/yjs';
import '@blocknote/shadcn/style.css';
import stringToColor from '@/lib/helpers/string-to-color';

type EditorProps = {
	doc: Y.Doc;
	provider: any;
	darkMode: boolean;
};

const BlockNote = ({ doc, provider, darkMode }: EditorProps) => {
	const userInfo = useSelf((me) => me.info);

	const editor: BlockNoteEditor = useCreateBlockNote(
		withCollaboration({
			collaboration: {
				provider,
				fragment: doc.getXmlFragment('document-store'),
				user: {
					name: userInfo?.name,
					color: stringToColor(userInfo?.email),
				},
			},
		}),
	);

	return (
		<div className="relative max-w-6xl">
			<BlockNoteView editor={editor} className="min-h-screen" theme={darkMode ? 'light' : 'dark'} />
		</div>
	);
};

const Editor = () => {
	const room = useRoom();
	const [doc, setDoc] = React.useState<Y.Doc>();
	const [provider, setProvider] = React.useState<LiveblocksYjsProvider>();
	const [darkMode, setDarkMode] = React.useState(false);

	const style = `hover:text-white ${
		darkMode
			? 'text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700'
			: 'text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-700'
	}`;

	React.useEffect(() => {
		const yDoc = new Y.Doc();
		const yProvider = new LiveblocksYjsProvider(room, yDoc);
		setDoc(yDoc);
		setProvider(yProvider);

		return () => {
			yDoc?.destroy();
			yProvider?.destroy();
		};
	}, [room]);

	if (!doc || !provider) return null;

	return (
		<div className="max-w-6xl mx-auto">
			<div className="flex items-center gap-2 justify-end mb-10">
				{/* Features */}
				{/* TranslateDoc - AI */}
				{/* ChatToDocument - AI */}

				{/* Dark Mode toggle */}
				<Button className={style} onClick={() => setDarkMode(!darkMode)}>
					{darkMode ? <SunIcon /> : <MoonIcon />}
				</Button>
			</div>

			{/* BlockNote */}
			<BlockNote doc={doc} provider={provider} darkMode={darkMode} />
		</div>
	);
};

export default Editor;
