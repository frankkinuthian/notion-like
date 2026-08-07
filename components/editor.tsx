'use client';

import * as React from 'react';
import { useRoom } from '@liveblocks/react/suspense';
import * as Y from 'yjs';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { Button } from './ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';

type EditorProps = {};

const Editor = (props: EditorProps) => {
	const room = useRoom();
	const [doc, setDoc] = React.useState<Y.Doc>();
	const [provider, setProvider] = React.useState<LiveblocksYjsProvider>();
	const [darkMode, setDarkMode] = React.useState(false);

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
				{/* ChatToDocument - AI */}
                
				{/* Dark Mode toggle */}
				<Button className={style} onClick={() => setDarkMode(!darkMode)}>
					{darkMode ? <SunIcon /> : <MoonIcon />}
				</Button>
			</div>

			{/* BlockNote */}
		</div>
	);
};

export default Editor;
