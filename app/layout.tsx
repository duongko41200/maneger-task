import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { GroupProvider } from '@/lib/contexts/GroupContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Project Dashboard',
	description: 'A project management dashboard',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<GroupProvider>
					{children}
					<Toaster />
				</GroupProvider>
			</body>
		</html>
	);
}
