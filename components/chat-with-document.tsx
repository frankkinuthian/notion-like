'use client';

import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { useCreateBlockNoteWithLiveblocks } from '@liveblocks/react-blocknote';
import { BotIcon, MessageCircleCode } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';

type LiveblocksBlockNoteEditor = ReturnType<typeof useCreateBlockNoteWithLiveblocks>;

const ChatWithDocument = ({ editor }: { editor: LiveblocksBlockNoteEditor }) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [input, setInput] = React.useState('');
	const [isPending, startTransition] = React.useTransition();
	const [summary, setSummary] = React.useState('');
	const [question, setQuestion] = React.useState('');

	const handleAskedQuestion = async (e: React.FormEvent) => {
		e.preventDefault();

		setQuestion(input);

		startTransition(async () => {
			const documentData = editor.blocksToMarkdownLossy().trim();

			const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chat-to-document`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					documentData,
					question: input,
				}),
			});

			if (!res.ok) {
				console.error('Chat worker responded with', res.status, await res.text());
				toast.error('Failed to ask a question about the document.');
				return;
			}

			const { message } = await res.json();

			setInput('');
			setSummary(message);

			toast.success('Document question sloppified successfully.');
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<Button asChild variant={'outline'}>
				<DialogTrigger>
					<MessageCircleCode className="mr-2" />
					Document Chat with AI
				</DialogTrigger>
			</Button>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Chat with AI about the document.</DialogTitle>
					<DialogDescription>Ask a question regarding the document</DialogDescription>

					<hr className="mt-5" />
					{question && <p className="mt-5 text-gray-500">Q: {question}</p>}
				</DialogHeader>

				{summary && (
					<div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100">
						<div className="flex">
							<BotIcon className="w-10 shrink-0" />
							<p className="font-bold">GPT {isPending ? 'discombobulating...' : 'Says...'}</p>
						</div>
						<p>{isPending ? 'Thinking' : <Markdown>{summary}</Markdown>}</p>
					</div>
				)}

				<form className="flex gap-2" onSubmit={handleAskedQuestion}>
					<Input
						type="text"
						placeholder="i.e. What is this about?..."
						className="w-full"
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>

					<Button type="submit" disabled={!input || isPending}>
						{isPending ? 'Discombobulating...' : 'Ask'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ChatWithDocument;
