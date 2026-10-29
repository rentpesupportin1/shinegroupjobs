import React from 'react';

export interface ShineLogoProps {
  variant?: 'badge' | 'horizontal' | 'icon' | 'image';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIso?: boolean;
  alt?: string;
}

/**
 * Shine Group Jobs Logo Component
 * Incorporates the ISO 9001:2015 Certified emblem, 
 * the green-blue circuit 'S' emblem, and Shine Group Jobs brand identity.
 */
export const ShineLogo: React.FC<ShineLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showIso = true,
  alt = 'Shine Group Jobs - ISO 9001:2015 Certified'
}) => {
  // If variant is 'badge' or 'image', display the high-resolution badge
  if (variant === 'badge' || variant === 'image') {
    const sizeClasses = {
      xs: 'h-8 max-w-[120px]',
      sm: 'h-10 max-w-[150px]',
      md: 'h-12 max-w-[190px]',
      lg: 'h-16 max-w-[240px]',
      xl: 'h-24 max-w-[340px]'
    }[size];

    return (
      <div className={`relative inline-flex items-center overflow-hidden rounded-xl shadow-md border border-red-700/40 bg-[#c40011] p-1 ${className}`}>
        <img
          src="/shine_group_logo.png"
          alt={alt}
          referrerPolicy="no-referrer"
          className={`${sizeClasses} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
        />
      </div>
    );
  }

  // If variant is 'icon', show the circular/rounded emblem icon
  if (variant === 'icon') {
    const iconSizes = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    }[size];

    return (
      <div 
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#c40011] to-[#99000a] shadow-md border border-red-700/50 shrink-0 ${iconSizes} ${className}`}
        title="Shine Group Jobs"
      >
        <img
          src="/shine_emblem_icon.png"
          alt={alt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
      </div>
    );
  }

  // Default: 'horizontal' (designed specifically for Navbar, Modals, and Headers)
  // Combining the circular/square emblem with the crisp, high-contrast branding & ISO text
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Emblem Icon / Thumbnail */}
      <div className="relative overflow-hidden rounded-xl shadow-md border border-red-700/40 bg-[#c40011] shrink-0 w-10 h-10 sm:w-11 sm:h-11 group-hover:scale-105 transition-transform duration-200">
        <img
          src="/shine_emblem_icon.png"
          alt="Shine Emblem"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand & ISO Certification Title */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 font-display">
            Shine
          </span>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-emerald-600 font-display">
            Group
          </span>
          <span className="text-xs sm:text-xs font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-white shadow-2xs">
            Jobs
          </span>
        </div>

        {showIso && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase font-sans">
              ISO 9001 : 2015 CERTIFIED
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
