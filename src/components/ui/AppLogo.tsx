'use client';

import React, { memo, useMemo } from 'react';
import Image from 'next/image';
import AppIcon from './AppIcon';

interface AppLogoProps {
  src?: string; // Image source (optional)
  iconName?: string; // Icon name when no image
  size?: number; // Size for icon/image
  className?: string; // Additional classes
  imageClassName?: string; // Classes for the image
  onClick?: () => void; // Click handler
}

const AppLogo = memo(function AppLogo({
  src = '/astrologo.png',
  iconName = 'SparklesIcon',
  size = 48,
  className = '',
  imageClassName = '',
  onClick,
}: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center bg-transparent'];
    if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      {/* Show image if src provided, otherwise show icon */}
      {src ? (
        <Image
          src={src}
          alt="AstroParihar"
          width={size * 6}
          height={size * 1.5}
          className={`flex-shrink-0 object-contain bg-transparent ${imageClassName}`}
          style={{ width: 'auto', height: size * 1.4 }}
          priority={true}
          unoptimized={true}
        />
      ) : (
        <AppIcon name={iconName} size={size} className="flex-shrink-0" />
      )}
    </div>
  );
});

export default AppLogo;

