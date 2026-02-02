'use client';
import React, { useMemo, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { TypedObject } from '@byteswrite-admin/bep-core/interfaces';
import { isInvalidAndEmptyObject } from '@byteswrite-admin/bep-core/utils';

import CustomBlockTab from '@/common/components/tabs/CustomBlockTab';
import CustomLineTab from '@/common/components/tabs/CustomLineTab';

export interface ITabsStructure {
    type: 'line' | 'block';
    method: 'navigate' | 'query' | 'state';
    tabs: Record<string, React.JSX.Element | string>;
    defaultTab?: string;
    className?: string;
}

// TODO: typing on defaultTab
const useTabs = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>(() => searchParams.get('tab') ?? '');

    const getSelectedTab = useMemo(() => (tabs: ITabsStructure['tabs'], method: ITabsStructure['method'], queryParam = 'tab', defaultTab?: string): string => {
        const tabKeys = TypedObject.keys(tabs);

        if (!tabKeys.length) return '';
        if (method === 'state') return isInvalidAndEmptyObject(activeTab) ? (defaultTab ?? tabKeys[0]!) : activeTab;

        if (method === 'query') {
            const queryTab = searchParams.get(queryParam);
            const matchingKey = tabKeys.find(key => key === queryTab);
            return matchingKey ?? (defaultTab ?? tabKeys[0]!);
        }

        if (method === 'navigate') {
            const currentPath = pathname.split('/').pop() ?? '';
            const matchingKey = tabKeys.find(key => tabs[key] === currentPath);
            return matchingKey ?? (defaultTab ?? tabKeys[0]!);
        }

        return tabKeys[0]!;
    }, [activeTab, pathname, searchParams]);

    const updateTab = (newTab: string, method: ITabsStructure['method'], tabs: ITabsStructure['tabs']) => {
        if (method === 'state') setActiveTab(newTab);

        else if (method === 'query') {
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', newTab);
            router.push(`?${params}`);

        } else if (method === 'navigate') {
            const targetPath = tabs[newTab] as string;
            if (targetPath) {
                const pathParts = pathname.split('/');
                pathParts[pathParts.length - 1] = targetPath;
                router.push(pathParts.join('/'));
            }
        }
    };

    const getTabs = ({ type, method, tabs, defaultTab, className }: ITabsStructure): { Tabs: React.JSX.Element; Content?: React.JSX.Element | string; activeTab: string } => {
        const TabComponent = type === 'line' ? CustomLineTab : CustomBlockTab;
        const selectedTab = getSelectedTab(tabs, method, 'tab', defaultTab);

        const Tabs = <TabComponent className={className} labels={TypedObject.keys(tabs)} selectedTab={selectedTab} onTabChange={(newTab) => updateTab(newTab, method, tabs)} />;
        const Content = selectedTab ? tabs[selectedTab] : undefined;
        const currentActiveTab = activeTab ? activeTab : (defaultTab ?? TypedObject.keys(tabs)[0]!);
        return { Tabs, Content, activeTab: currentActiveTab };
    };

    return { getTabs };
};

export default useTabs;
