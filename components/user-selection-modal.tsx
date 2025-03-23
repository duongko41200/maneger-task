import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface UserSelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (value: string) => void;
}

const users = [
	{ id: 'DP', name: 'Duong Pham' },
	{ id: 'NM', name: 'Nguyen Minh' },
];

export default function UserSelectionModal({
	isOpen,
	onClose,
	onSave,
}: UserSelectionModalProps) {
	const handleSave = (value: string) => {
		localStorage.setItem('member_aptis_name', value);
		onSave(value);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Who are you?</DialogTitle>
				</DialogHeader>
				<div className="py-6">
					<Select onValueChange={handleSave}>
						<SelectTrigger>
							<SelectValue placeholder="Select your name" />
						</SelectTrigger>
						<SelectContent>
							{users.map((user) => (
								<SelectItem key={user.id} value={user.id}>
									{user.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</DialogContent>
		</Dialog>
	);
}
