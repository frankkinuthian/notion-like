'use client';

import * as React from 'react';
import type { useCreateBlockNoteWithLiveblocks } from '@liveblocks/react-blocknote';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BotIcon, LanguagesIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';

type Language = 'english' | 'spanish' | 'portuguese' | 'swahili' | 'french' | 'german';

const languages: Language[] = ['english', 'spanish', 'portuguese', 'swahili', 'french', 'german'];

/**
 * The Liveblocks wrapper widens BlockNote's schema with its own mention nodes,
 * so the editor type is derived from the hook rather than written out.
 */
type LiveblocksBlockNoteEditor = ReturnType<typeof useCreateBlockNoteWithLiveblocks>;

const TranslateDocSummary = ({ editor }: { editor: LiveblocksBlockNoteEditor }) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [language, setLanguage] = React.useState<string>('');
	const [summary, setSummary] = React.useState('');
	const [question, setQuestion] = React.useState('');

	const [isPending, startTransition] = React.useTransition();

	const handleAskedQuestion = (e: React.FormEvent) => {
		e.preventDefault();

		startTransition(async () => {
			// Read through the editor rather than the underlying Y.Doc. This is the
			// content the user can actually see, and it avoids depending on the
			// Yjs fragment name, which has to match the Liveblocks extension's
			// `field` and fails silently when it does not.
			const documentData = editor.blocksToMarkdownLossy().trim();

			if (!documentData) {
				toast.error('There is nothing in this document to translate yet.');
				return;
			}

			const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/translate-document-summary`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					documentData,
					// The worker destructures `targetLanguage`. Sending any other key
					// leaves target_lang undefined on the m2m100 call.
					targetLanguage: language,
				}),
			});

			if (!res.ok) {
				console.error('Translate worker responded with', res.status, await res.text());
				toast.error('Failed to translate the document summary.');
				return;
			}

			const { translated_text } = await res.json();
			setSummary(translated_text);

			toast.success('Translated document summary successfully.');
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<Button asChild variant={'outline'}>
				<DialogTrigger>
					<LanguagesIcon />
					Translate
				</DialogTrigger>
			</Button>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Translate the document</DialogTitle>

					<DialogDescription>
						Select a language and AI will translate a summary of the document in the selected language.
					</DialogDescription>

					<hr className="mt-5" />

					{question && <p className="mt-5 text-gray-500">Q: {question}</p>}
				</DialogHeader>

				{summary && (
					<div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100">
						<div className="flex">
							<BotIcon className="w-10 shrink-0" />
							<p className="font-bold">GPT {isPending ? 'is thinking...' : 'says'}</p>
						</div>

						<p>{isPending ? 'Thinking...' : <Markdown>{summary}</Markdown>}</p>
					</div>
				)}

				<form onSubmit={handleAskedQuestion}>
					<Select value={language} onValueChange={(value) => setLanguage(value)}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a language..." />
						</SelectTrigger>

						<SelectContent>
							{languages.map((language) => (
								<SelectItem key={language} value={language}>
									{language.charAt(0).toUpperCase() + language.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button type="submit" disabled={!language || isPending}>
						{isPending ? 'Translating...' : 'Translate'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default TranslateDocSummary;
