import * as React from 'react';

import { cn } from '@/lib/utils';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement> & { tableClassName?: string }>(({ className, tableClassName, ...props }, ref) => (
    <div className={`relative w-full overflow-auto border max-h-dvh bg-card
        [&::-webkit-scrollbar:vertical]:w-0
      [&::-webkit-scrollbar:horizontal]:h-3
      [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb:horizontal]:bg-muted-foreground ${className}`}>
        <table ref={ref} className={cn('min-w-full w-full text-sm', tableClassName)} {...props} />
    </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('border-t last:[&>tr]:border-b-0 sticky bottom-0 bg-card hover:bg-muted/50', className)} {...props} />));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('border-b border-border transition-colors data-[state=selected]:bg-muted/50', className)} {...props} />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
    <th ref={ref} className={cn('h-12 px-4 font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 sticky top-0 bg-muted/50 z-10', className)} {...props} />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
    <td ref={ref} className={cn('p-3 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell };
