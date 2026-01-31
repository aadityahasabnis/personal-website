'use client';

import { memo } from 'react';

/**
 * Ambient Background with floating gradient spheres
 * Creates a beautiful, subtle animated background effect
 */
export const AmbientBackground = memo(() => {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-sphere ambient-sphere-1" />
      <div className="ambient-sphere ambient-sphere-2" />
      <div className="ambient-sphere ambient-sphere-3" />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';

export default AmbientBackground;
