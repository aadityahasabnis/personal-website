'use client';

import useTabs, { type ITabsStructure } from '@/common/hooks/useTabs';

const TableTabs = ({ tabsStructure, className }: { tabsStructure: ITabsStructure; className?: string }) => {
    const { getTabs } = useTabs();
    return getTabs({ ...tabsStructure, className: `w-full ${className}` })?.Tabs;
};

export default TableTabs;
