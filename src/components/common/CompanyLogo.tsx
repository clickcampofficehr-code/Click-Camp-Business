import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

export interface CompanyLogoProps {
  variant?: 'full' | 'mark' | 'compact' | 'badge' | 'cc';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
  onClick?: () => void;
}

/**
 * Enterprise 'CC' Stylized Geometric Monogram
 * Designed with vibrant neon-green gradients and cyber glass depth
 */
export const CCLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 38,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="ClickCamp CC Enterprise Logo"
    >
      <defs>
        {/* Vibrant Neon Green & Emerald Gradients */}
        <linearGradient id="cc-neon-primary" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00FF87" />
          <stop offset="45%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="cc-neon-secondary" x1="40" y1="20" x2="95" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Ambient Dark Charcoal Squircle Plate */}
        <linearGradient id="cc-plate-glass" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F1714" />
          <stop offset="100%" stopColor="#060A08" />
        </linearGradient>

        {/* Neon Glow Filter */}
        <filter id="cc-glow-filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#10B981" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Rounded Glass Squircle Plate */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="22"
        fill="url(#cc-plate-glass)"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeOpacity="0.35"
      />

      {/* First 'C' - Outer Monogram Wave */}
      <path
        d="M 45 28 C 33.5 28 25 37 25 50 C 25 63 33.5 72 45 72 C 50 72 54 70 56.5 67.5 L 51.5 61 C 49.8 62.5 47.5 63.5 45 63.5 C 38 63.5 33.5 57.5 33.5 50 C 33.5 42.5 38 36.5 45 36.5 C 47.5 36.5 49.8 37.5 51.5 39 L 56.5 32.5 C 54 30 50 28 45 28 Z"
        fill="url(#cc-neon-primary)"
        filter="url(#cc-glow-filter)"
      />

      {/* Second 'C' - Interlocking Modern Monogram Wave */}
      <path
        d="M 67 34 C 58 34 51.5 41 51.5 50 C 51.5 59 58 66 67 66 C 71 66 74 64.5 76 62 L 71.5 56 C 70.2 57.2 68.8 58 67 58 C 62.5 58 59.5 54.5 59.5 50 C 59.5 45.5 62.5 42 67 42 C 68.8 42 70.2 42.8 71.5 44 L 76 38 C 74 35.5 71 34 67 34 Z"
        fill="url(#cc-neon-secondary)"
        filter="url(#cc-glow-filter)"
      />

      {/* Micro Cyan-Green Specular Spark */}
      <circle cx="78" cy="24" r="3" fill="#00FF87" />
    </svg>
  );
};

export const CompanyLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="ClickCamp Logo Mark"
    >
      <defs>
        {/* Slanted Pill Gradient */}
        <linearGradient id="cc-pill-gradient" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="50%" stopColor="#1E6BFF" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>

        {/* Circular Dot Gradient */}
        <linearGradient id="cc-dot-gradient" x1="60" y1="12" x2="88" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="60%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#0047CC" />
        </linearGradient>

        {/* Glow & Depth Filters */}
        <filter id="cc-shadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0052FF" floodOpacity="0.28" />
        </filter>
        <filter id="cc-dot-shadow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#00D2FF" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Background Soft Glow Plate (Subtle) */}
      <circle cx="50" cy="50" r="46" fill="#0066FF" fillOpacity="0.05" />

      {/* Main Slanted Pill Shape (Angled Diagonal Capsule) */}
      <g filter="url(#cc-shadow)">
        <rect
          x="38"
          y="20"
          width="24"
          height="62"
          rx="12"
          transform="rotate(38 50 51)"
          fill="url(#cc-pill-gradient)"
        />
      </g>

      {/* Inner Highlight Reflection on Slanted Pill */}
      <rect
        x="42"
        y="23"
        width="8"
        height="34"
        rx="4"
        transform="rotate(38 50 51)"
        fill="#FFFFFF"
        fillOpacity="0.32"
      />

      {/* Circular Dot Beside Slanted Pill */}
      <g filter="url(#cc-dot-shadow)">
        <circle
          cx="76"
          cy="26"
          r="12.5"
          fill="url(#cc-dot-gradient)"
        />
      </g>

      {/* Dot Specular Highlight */}
      <circle
        cx="72.5"
        cy="22.5"
        r="4"
        fill="#FFFFFF"
        fillOpacity="0.45"
      />

      {/* Tiny Secondary Anchor Accent Dot (Click Ripple Indicator) */}
      <circle
        cx="25"
        cy="75"
        r="3.5"
        fill="#00D2FF"
        fillOpacity="0.55"
      />
    </svg>
  );
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'auto',
  showSubtitle = true,
  onClick
}) => {
  const { companyLogoUrl, setIsBrandModalOpen } = useWorkspace();

  // Resolve numerical size based on token
  const getDimensions = () => {
    if (typeof size === 'number') return { markSize: size, height: size };
    switch (size) {
      case 'xs':
        return { markSize: 22, height: 22 };
      case 'sm':
        return { markSize: 28, height: 28 };
      case 'md':
        return { markSize: 36, height: 36 };
      case 'lg':
        return { markSize: 44, height: 44 };
      case 'xl':
        return { markSize: 56, height: 56 };
      default:
        return { markSize: 36, height: 36 };
    }
  };

  const { markSize } = getDimensions();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (setIsBrandModalOpen) {
      e.stopPropagation();
      setIsBrandModalOpen(true);
    }
  };

  // Render Custom Uploaded Logo Image if provided by user
  const renderCustomLogo = () => {
    if (!companyLogoUrl) return null;
    return (
      <img
        src={companyLogoUrl}
        alt="ClickCamp Company Logo"
        referrerPolicy="no-referrer"
        style={{ width: markSize, height: markSize }}
        className="object-contain rounded-lg shrink-0 transition-transform group-hover:scale-105"
      />
    );
  };

  // Mark-only variant (icon / square avatar)
  if (variant === 'mark') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title="ClickCamp Brand Identity (Click to view or customize)"
        className={`group inline-flex items-center justify-center rounded-xl transition cursor-pointer p-0.5 ${className}`}
      >
        {companyLogoUrl ? (
          renderCustomLogo()
        ) : (
          <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95">
            <CompanyLogoMark size={markSize} />
          </div>
        )}
      </button>
    );
  }

  // Compact variant (Mark + inline ClickCamp text)
  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        title="ClickCamp Brand Identity"
        className={`group inline-flex items-center gap-2 cursor-pointer transition select-none ${className}`}
      >
        {companyLogoUrl ? renderCustomLogo() : <CompanyLogoMark size={markSize} />}
        <div className="flex items-center leading-none">
          <span className={`font-black tracking-tight text-sm ${theme === 'dark' ? 'text-white' : 'text-neutral-900 group-hover:text-blue-600'}`}>
            Click
          </span>
          <span className="font-black tracking-tight text-sm text-blue-600">
            Camp
          </span>
        </div>
      </div>
    );
  }

  // Badge variant (enclosed pill)
  if (variant === 'badge') {
    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        title="ClickCamp Technologies"
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-blue-200/80 bg-blue-50/70 text-blue-950 cursor-pointer hover:bg-blue-100/70 transition select-none ${className}`}
      >
        {companyLogoUrl ? (
          <img
            src={companyLogoUrl}
            alt="ClickCamp Logo"
            referrerPolicy="no-referrer"
            className="w-4 h-4 object-contain rounded-full"
          />
        ) : (
          <CompanyLogoMark size={18} />
        )}
        <span className="text-xs font-bold tracking-tight">
          Click<span className="text-blue-600">Camp</span>
        </span>
      </div>
    );
  }

  // CC Variant (CC Monogram + ClickCamp Technologies + OPERATIONS V3.0 badge)
  if (variant === 'cc') {
    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        title="ClickCamp Technologies"
        className={`group inline-flex items-center gap-3.5 cursor-pointer select-none transition ${className}`}
      >
        <div className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.3)]">
          {companyLogoUrl ? renderCustomLogo() : <CCLogoMark size={markSize || 40} />}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-base sm:text-lg text-white font-sans">
              ClickCamp Technologies
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              OPERATIONS V3.0
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[11px] text-neutral-400 tracking-wide">
              Enterprise Identity & Access Management
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default Full Variant (Mark + Wordmark + Subtitle)
  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="ClickCamp Technologies Workspace (Click to view brand guidelines & custom logo)"
      className={`group flex items-center gap-3 cursor-pointer select-none transition ${className}`}
    >
      <div className="relative shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
        {companyLogoUrl ? (
          renderCustomLogo()
        ) : (
          <div className="p-1 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 shadow-xs">
            <CompanyLogoMark size={markSize} />
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight text-base ${
              theme === 'dark'
                ? 'text-white'
                : 'text-neutral-900 group-hover:text-blue-600 transition-colors'
            }`}
          >
            Click
          </span>
          <span className="font-black tracking-tight text-base text-blue-600">
            Camp
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`text-[9.5px] uppercase font-bold tracking-wider mt-0.5 truncate ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            Technologies
          </span>
        )}
      </div>
    </div>
  );
};
