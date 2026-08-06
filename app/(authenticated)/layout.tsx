import Header from '@/components/header';
import Sidebar from '@/components/sidebar';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />
			<div className="flex min-h-screen">
				{/* Sidebar */}
				<Sidebar />
				<div
					className="flex-1 p-4 bg-gray-100 overflow-y-auto
                scrollbar-hide
                "
				>
					{children}
				</div>
			</div>
		</>
	);
}
