import { SITE_CONFIG } from '@/constants/siteConstants';
import { ImageResponse } from 'next/og';

const trimText = (value: string | null, fallback: string, maxLength: number): string => {
    const candidate = value ?? fallback;
    return candidate.replace(/\s+/g, ' ').trim().slice(0, maxLength);
};

const parseTags = (value: string | null): string[] => {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 4);
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const title = trimText(searchParams.get('title'), SITE_CONFIG.title, 110);
    const subtitle = trimText(searchParams.get('subtitle'), SITE_CONFIG.description, 180);
    const eyebrow = trimText(searchParams.get('eyebrow'), SITE_CONFIG.name, 56);
    const tags = parseTags(searchParams.get('tags'));

    return new ImageResponse(
        <div
            style={{
                width: '1200px',
                height: '630px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                padding: '56px',
                gap: '32px',
                background: 'linear-gradient(135deg, #09090b 0%, #111827 50%, #1f1f2a 100%)',
                color: '#f5f5f5',
                fontFamily: 'Geist, Inter, sans-serif',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a78bfa' }}>{eyebrow}</div>

                <div style={{ fontSize: '70px', lineHeight: 1.02, fontWeight: 700, maxWidth: '1060px', letterSpacing: '-0.02em' }}>{title}</div>

                <div style={{ fontSize: '30px', lineHeight: 1.3, color: '#d1d5db', maxWidth: '1040px' }}>{subtitle}</div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#d1d5db', fontSize: '24px' }}>
                    <span style={{ color: '#a78bfa', fontSize: '28px' }}>@</span>
                    <span>{SITE_CONFIG.author.name}</span>
                </div>

                {tags.length > 0 ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '720px' }}>
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                style={{
                                    border: '1px solid rgba(167, 139, 250, 0.5)',
                                    background: 'rgba(167, 139, 250, 0.15)',
                                    borderRadius: '999px',
                                    padding: '8px 16px',
                                    fontSize: '20px',
                                    color: '#ddd6fe',
                                }}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>,
        {
            width: 1200,
            height: 630,
        },
    );
}
