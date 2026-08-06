import Document from '@/components/document';

const DocumentPage = async ({ params }: PageProps<'/doc/[id]'>) => {
	const { id } = await params;

	return (
		<div className="flex flex-col flex-1 min-h-screen">
			<Document id={id} />
		</div>
	);
};

export default DocumentPage;
