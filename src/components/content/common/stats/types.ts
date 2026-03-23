export type IContentStatsType = 'articles' | 'blogs' | 'projects';

export interface IContentStatsProps {
    contentId: string;
    contentType: IContentStatsType;
    className?: string;
}

export interface IContentStatsLabelProps extends IContentStatsProps {
    showIcon?: boolean;
}
