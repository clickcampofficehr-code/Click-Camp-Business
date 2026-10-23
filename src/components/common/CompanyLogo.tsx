import React from 'react';

export const PERMANENT_COMPANY_LOGO_URL =
  '/assets/aistudio/Screenshot_2026-10-24-00-57-32-302_com.whatsapp.w4b-edit_b2bfc3c1.jpg';

export interface CompanyLogoProps {
  variant?: 'full' | 'mark' | 'compact' | 'badge' | 'cc';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
  onClick?: () => void;
}

/**
 * Permanent Company Logo Emblem (Unchangeable Official Asset)
 */
export const CCLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 38,
  className = ''
}) => {
  return (
    <img
      src={PERMANENT_COMPANY_LOGO_URL}
      alt="ClickCamp Official Logo"
      style={{ height: size, width: 'auto' }}
      className={`object-contain rounded-lg shrink-0 select-none ${className}`}
    />
  );
};

export const CompanyLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = ''
}) => {
  return (
    <img
      src={PERMANENT_COMPANY_LOGO_URL}
      alt="ClickCamp Official Logo"
      style={{ height: size, width: 'auto' }}
      className={`object-contain rounded-lg shrink-0 select-none ${className}`}
    />
  );
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'auto',
  showSubtitle = true
}) => {
  const getDimensions = () => {
    if (typeof size === 'number') return { markSize: size, height: size };
    switch (size) {
      case 'xs':
        return { markSize: 24, height: 24 };
      case 'sm':
        return { markSize: 30, height: 30 };
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

  const renderPermanentLogo = (customHeight?: number) => (
    <img
      src={PERMANENT_COMPANY_LOGO_URL}
      alt="ClickCamp Company Logo"
      style={{ height: customHeight || markSize, width: 'auto' }}
      className="object-contain rounded-lg shrink-0 select-none"
    />
  );

  // Mark-only variant
  if (variant === 'mark') {
    return (
      <div
        title="ClickCamp Technologies"
        className={`inline-flex items-center justify-center rounded-xl select-none p-0.5 ${className}`}
      >
        {renderPermanentLogo()}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        title="ClickCamp Technologies"
        className={`inline-flex items-center gap-2 select-none ${className}`}
      >
        {renderPermanentLogo()}
        <div className="flex items-center leading-none">
          <span
            className={`font-black tracking-tight text-sm ${
              theme === 'dark' ? 'text-white' : 'text-neutral-900'
            }`}
          >
            Click
          </span>
          <span className="font-black tracking-tight text-sm text-blue-600">
            Camp
          </span>
        </div>
      </div>
    );
  }

  // Badge variant
  if (variant === 'badge') {
    return (
      <div
        title="ClickCamp Technologies"
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-blue-200/80 bg-blue-50/70 text-blue-950 select-none ${className}`}
      >
        <img
          src={PERMANENT_COMPANY_LOGO_URL}
          alt="ClickCamp Logo"
          className="h-4 w-auto object-contain rounded-xs"
        />
        <span className="text-xs font-bold tracking-tight">
          Click<span className="text-blue-600">Camp</span>
        </span>
      </div>
    );
  }

  // CC Variant
  if (variant === 'cc') {
    return (
      <div
        title="ClickCamp Technologies"
        className={`inline-flex items-center gap-3.5 select-none ${className}`}
      >
        <div className="relative shrink-0 flex items-center justify-center">
          {renderPermanentLogo(markSize || 40)}
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

  // Default Full Variant
  return (
    <div
      title="ClickCamp Technologies Workspace"
      className={`flex items-center gap-2.5 select-none ${className}`}
    >
      <div className="relative shrink-0 flex items-center justify-center">
        {renderPermanentLogo()}
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1 leading-none">
          <span
            className={`font-black tracking-tight text-base ${
              theme === 'dark' ? 'text-white' : 'text-neutral-900'
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
