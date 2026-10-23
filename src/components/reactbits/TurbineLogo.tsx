import React from 'react';

interface TurbineLogoProps {
  criticalCount?: number;
  className?: string;
  size?: number;
}

export const TurbineLogo: React.FC<TurbineLogoProps> = ({
  criticalCount = 0,
  className = '',
  size = 28,
}) => {
  // Speed reflects fleet status: normal fleet is smooth (7s), warning/critical is agitated or sluggish
  // If critical alarms exist, turbine speed is adjusted to reflect alert condition (3s or slower)
  const durationSec = criticalCount > 2 ? 3.5 : criticalCount > 0 ? 5 : 7.5;

  return (
    <div
      className={`relative inline-flex items-center justify-center text-wind-600 dark:text-wind-400 ${className}`}
      style={{ width: size, height: size }}
      title={criticalCount > 0 ? `${criticalCount} critical alerts active` : 'Fleet status nominal'}
    >
      <svg
        viewBox="0 0 28 28"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Tower and nacelle base */}
        <path d="M14 14v11M11 25h6" strokeOpacity="0.75" />

        {/* Rotating 3-blade hub */}
        <g
          className="origin-center"
          style={{
            transformOrigin: '14px 14px',
            animation: `spin ${durationSec}s linear infinite`,
          }}
        >
          {/* Central hub */}
          <circle cx="14" cy="14" r="2.2" fill="currentColor" />
          {/* Blade 1 (top) */}
          <path d="M14 11.8V3.5c0-.8.7-1.5 1.2-1.5.3 0 .6.3.6.8v9" />
          {/* Blade 2 (bottom right 120deg) */}
          <path d="M15.9 15.1l7.2 4.1c.7.4.8 1.4.3 1.9-.2.2-.6.3-.9.1l-7.7-4.5" />
          {/* Blade 3 (bottom left 240deg) */}
          <path d="M12.1 15.1l-7.2 4.1c-.7.4-.8 1.4-.3 1.9.2.2.6.3.9.1l7.7-4.5" />
        </g>
      </svg>
    </div>
  );
};

export default TurbineLogo;
