'use client';

import { useState, useCallback } from 'react';
import { Download, FileJson, FileSpreadsheet, Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportAllContent, exportArticlesCSV, exportNotesCSV, exportCollection, type IBackupData } from '@/server/actions/backup';
import { exportSubscribers } from '@/server/actions/subscribers';

type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

interface IExportOption {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    format: 'json' | 'csv';
    action: () => Promise<{ success: boolean; data?: unknown; error?: string }>;
}

export function BackupPanel(): React.ReactElement {
    const [status, setStatus] = useState<Record<string, ExportStatus>>({});
    const [lastBackup, setLastBackup] = useState<IBackupData | null>(null);

    const downloadFile = useCallback((content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const handleExport = useCallback(async (option: IExportOption) => {
        setStatus(s => ({ ...s, [option.id]: 'loading' }));
        try {
            const result = await option.action();
            if (result.success && result.data) {
                const date = new Date().toISOString().split('T')[0];
                if (option.format === 'json') {
                    const content = JSON.stringify(result.data, null, 2);
                    downloadFile(content, `${option.id}-${date}.json`, 'application/json');
                    if (option.id === 'full-backup') setLastBackup(result.data as IBackupData);
                } else {
                    downloadFile(result.data as string, `${option.id}-${date}.csv`, 'text/csv');
                }
                setStatus(s => ({ ...s, [option.id]: 'success' }));
                setTimeout(() => setStatus(s => ({ ...s, [option.id]: 'idle' })), 3000);
            } else {
                setStatus(s => ({ ...s, [option.id]: 'error' }));
            }
        } catch {
            setStatus(s => ({ ...s, [option.id]: 'error' }));
        }
    }, [downloadFile]);

    const exportOptions: IExportOption[] = [
        {
            id: 'full-backup',
            title: 'Full Backup (JSON)',
            description: 'Export all content including articles, notes, projects, topics, subscribers, and settings',
            icon: <Database className="h-5 w-5" />,
            format: 'json',
            action: exportAllContent,
        },
        {
            id: 'articles-csv',
            title: 'Articles (CSV)',
            description: 'Export articles list with titles, slugs, status, and dates',
            icon: <FileSpreadsheet className="h-5 w-5" />,
            format: 'csv',
            action: exportArticlesCSV,
        },
        {
            id: 'notes-csv',
            title: 'Notes (CSV)',
            description: 'Export notes list with titles, tags, and dates',
            icon: <FileSpreadsheet className="h-5 w-5" />,
            format: 'csv',
            action: exportNotesCSV,
        },
        {
            id: 'subscribers-csv',
            title: 'Subscribers (CSV)',
            description: 'Export all subscriber emails with status',
            icon: <FileSpreadsheet className="h-5 w-5" />,
            format: 'csv',
            action: () => exportSubscribers('all'),
        },
    ];

    const getStatusIcon = (id: string) => {
        const s = status[id];
        if (s === 'loading') return <Loader2 className="h-4 w-4 animate-spin" />;
        if (s === 'success') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (s === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />;
        return <Download className="h-4 w-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Export Options */}
            <div className="grid gap-4 md:grid-cols-2">
                {exportOptions.map((option) => (
                    <div key={option.id} className="rounded-lg border bg-card p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    {option.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{option.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport(option)}
                                disabled={status[option.id] === 'loading'}
                                className="w-full"
                            >
                                {getStatusIcon(option.id)}
                                <span className="ml-2">
                                    {status[option.id] === 'loading' ? 'Exporting...' :
                                     status[option.id] === 'success' ? 'Downloaded!' :
                                     status[option.id] === 'error' ? 'Failed - Retry' : 'Export'}
                                </span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Last Backup Stats */}
            {lastBackup && (
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="font-semibold mb-4">Last Backup Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {Object.entries(lastBackup.stats).map(([key, value]) => (
                            <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                                <p className="text-2xl font-bold">{value}</p>
                                <p className="text-xs text-muted-foreground capitalize">{key}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        Exported at: {new Date(lastBackup.exportedAt).toLocaleString()}
                    </p>
                </div>
            )}

            {/* Info */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex gap-3">
                    <FileJson className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-blue-500">Backup Tips</p>
                        <ul className="mt-2 text-muted-foreground space-y-1">
                            <li>• Full backup includes all content and can be used to restore your site</li>
                            <li>• CSV exports are ideal for spreadsheet analysis or importing to other systems</li>
                            <li>• Schedule regular backups to protect against data loss</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
