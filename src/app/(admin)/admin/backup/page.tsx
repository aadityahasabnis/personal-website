import { Database, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { PageHeader } from '@/components/admin';
import { BackupPanel } from './BackupPanel';

export const metadata = {
    title: 'Backup & Export | Admin Dashboard',
    description: 'Export and backup your content',
};

export default function BackupPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Backup & Export"
                description="Export your content for backup or migration"
                icon={Database}
            />
            <BackupPanel />
        </div>
    );
}
