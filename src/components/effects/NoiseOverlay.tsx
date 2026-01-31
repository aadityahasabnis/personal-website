'use client';

import { memo } from 'react';

/**
 * Subtle noise texture overlay for premium visual depth
 */
export const NoiseOverlay = memo(() => {
  return <div className="noise-overlay" aria-hidden="true" />;
});

NoiseOverlay.displayName = 'NoiseOverlay';

export default NoiseOverlay;
