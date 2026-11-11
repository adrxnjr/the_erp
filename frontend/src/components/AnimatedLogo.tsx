import React from 'react';
import { useBranding } from '../context/BrandingContext';
import './AnimatedLogo.css';

interface AnimatedLogoProps {
  className?: string;
  subtext?: string;
  idPrefix?: string;
  title?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  className = 'w-full max-w-[360px] sm:max-w-[420px]',
  subtext,
  idPrefix = 'logo',
  title,
}) => {
  let brandName = 'Ever Grow Schools';
  let brandTagline = 'Excellence in Holistic Education';
  let customLogoUrl: string | null = null;
  try {
    const branding = useBranding();
    brandName = branding.schoolName;
    brandTagline = branding.tagline;
    customLogoUrl = branding.customLogoUrl;
  } catch {}

  const displayTitle = title || brandName || 'Ever Grow Schools';
  const displaySubtext = subtext !== undefined ? subtext : brandTagline;
  const p = idPrefix;

  if (customLogoUrl) {
    return (
      <div className={`flex items-center gap-2.5 p-1.5 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-[#F5F6F8] shadow-[2px_2px_5px_#D4DAE5,-2px_-2px_5px_#FFFFFF] p-1 flex items-center justify-center shrink-0 border border-white/80">
          <img
            src={customLogoUrl}
            alt={displayTitle}
            className="w-full h-full object-contain rounded-lg animate-logo-float"
          />
        </div>
        <div className="min-w-0 text-left overflow-hidden">
          <div className="text-xs font-black tracking-tight text-slate-800 truncate leading-tight">
            {displayTitle}
          </div>
          {displaySubtext && (
            <div className="text-[10px] font-semibold text-slate-400 tracking-tight truncate leading-tight mt-0.5">
              {displaySubtext}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`animated-logo-container ${className}`}>
      <div className="animated-logo-inner animate-logo-float">
        {/* Layered Paint Strokes Vector Artwork matching Welcome Screen animation */}
        <svg
          viewBox="0 0 1100 600"
          className="animated-logo-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`${p}-magenta-purple`} x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#FF007A" />
              <stop offset="35%" stopColor="#D500F9" />
              <stop offset="70%" stopColor="#8A00E6" />
              <stop offset="100%" stopColor="#4A00E0" />
            </linearGradient>

            <linearGradient id={`${p}-royal-blue`} x1="0%" y1="10%" x2="100%" y2="90%">
              <stop offset="0%" stopColor="#7928CA" />
              <stop offset="40%" stopColor="#2563EB" />
              <stop offset="75%" stopColor="#0071E3" />
              <stop offset="100%" stopColor="#00D2FF" />
            </linearGradient>

            <linearGradient id={`${p}-orange-sunburst`} x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#E60049" />
              <stop offset="25%" stopColor="#FF2A42" />
              <stop offset="55%" stopColor="#FF7700" />
              <stop offset="85%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#FFD600" />
            </linearGradient>

            <linearGradient id={`${p}-cyan-emerald`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5856D6" />
              <stop offset="30%" stopColor="#00B4D8" />
              <stop offset="65%" stopColor="#06D6A0" />
              <stop offset="90%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#84CC16" />
            </linearGradient>

            <linearGradient id={`${p}-deep-violet`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C026D3" />
              <stop offset="50%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#312E81" />
            </linearGradient>

            <filter id={`${p}-paint-shadow`} x="-5%" y="-5%" width="115%" height="115%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>

            <filter id={`${p}-text-shadow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.55" />
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* LAYER 1: Deep Violet / Blue Back Sweep */}
          <g className="logo-sweep-1" filter={`url(#${p}-paint-shadow)`}>
            <path
              d="M 60 270 C 130 180, 260 110, 440 90 C 530 80, 610 115, 680 170 C 580 185, 470 215, 360 275 C 240 340, 140 435, 95 480 C 70 410, 55 330, 60 270 Z"
              fill={`url(#${p}-deep-violet)`}
            />
            <path
              d="M 85 245 C 160 170, 280 120, 440 102 C 510 95, 590 125, 640 160"
              stroke="#E879F9"
              strokeWidth="5"
              fill="none"
              opacity="0.45"
              strokeLinecap="round"
            />
            <path
              d="M 115 280 C 190 205, 310 150, 460 135"
              stroke="#C084FC"
              strokeWidth="4"
              fill="none"
              opacity="0.35"
              strokeLinecap="round"
            />
          </g>

          {/* LAYER 2: Upper Magenta / Fuchsia Sweep */}
          <g className="logo-sweep-2" filter={`url(#${p}-paint-shadow)`}>
            <path
              d="M 45 360 C 25 280, 50 180, 120 120 C 195 55, 310 40, 430 70 C 370 88, 305 115, 235 160 C 150 215, 95 285, 45 360 Z"
              fill={`url(#${p}-magenta-purple)`}
            />
            <path
              d="M 65 310 C 55 220, 115 130, 205 85 C 275 50, 360 55, 420 72"
              stroke="#FFA8E8"
              strokeWidth="6"
              fill="none"
              opacity="0.6"
              strokeLinecap="round"
            />
            <path
              d="M 90 340 C 95 255, 145 165, 240 118 C 300 90, 370 85, 410 95"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              fill="none"
              opacity="0.4"
              strokeLinecap="round"
            />
            <path
              d="M 125 365 C 135 290, 190 210, 275 165 C 330 135, 395 130, 425 140"
              stroke="#E879F9"
              strokeWidth="4"
              fill="none"
              opacity="0.5"
              strokeLinecap="round"
            />
          </g>

          {/* LAYER 3: Center Royal & Electric Blue Sweep */}
          <g className="logo-sweep-3" filter={`url(#${p}-paint-shadow)`}>
            <path
              d="M 210 240 C 280 145, 420 85, 590 100 C 665 105, 730 135, 780 180 C 695 185, 580 205, 470 255 C 380 298, 300 370, 245 465 C 220 400, 205 315, 210 240 Z"
              fill={`url(#${p}-royal-blue)`}
            />
            <path
              d="M 235 220 C 310 140, 440 98, 585 110 C 655 115, 715 140, 755 175"
              stroke="#60A5FA"
              strokeWidth="5"
              fill="none"
              opacity="0.55"
              strokeLinecap="round"
            />
            <path
              d="M 270 255 C 350 175, 475 135, 610 145 C 675 150, 730 175, 765 205"
              stroke="#93C5FD"
              strokeWidth="3"
              fill="none"
              opacity="0.4"
              strokeLinecap="round"
            />
          </g>

          {/* LAYER 4: Sweeping Orange & Gold Arch */}
          <g className="logo-sweep-4" filter={`url(#${p}-paint-shadow)`}>
            <path
              d="M 400 330 C 470 230, 590 170, 745 175 C 840 180, 930 220, 1025 295 C 990 325, 935 340, 865 330 C 760 315, 680 340, 585 390 C 510 430, 445 490, 405 560 C 390 495, 390 410, 400 330 Z"
              fill={`url(#${p}-orange-sunburst)`}
            />
            <path
              d="M 445 295 C 525 210, 640 178, 770 190 C 855 200, 935 235, 1005 285"
              stroke="#FEF08A"
              strokeWidth="6"
              fill="none"
              opacity="0.75"
              strokeLinecap="round"
            />
            <path
              d="M 490 315 C 570 235, 675 208, 800 220 C 880 230, 950 260, 1010 305"
              stroke="#FFFFFF"
              strokeWidth="4"
              fill="none"
              opacity="0.5"
              strokeLinecap="round"
            />
            <path
              d="M 430 355 C 505 285, 610 248, 730 255 C 820 265, 895 295, 960 340"
              stroke="#FDBA74"
              strokeWidth="5"
              fill="none"
              opacity="0.5"
              strokeLinecap="round"
            />
          </g>

          {/* LAYER 5: Cyan & Emerald Curling Bristles */}
          <g className="logo-sweep-5" filter={`url(#${p}-paint-shadow)`}>
            <path
              d="M 480 430 C 540 380, 625 355, 715 350 C 820 345, 920 385, 1000 460 C 935 485, 850 480, 775 450 C 700 420, 625 435, 560 485 C 525 510, 495 545, 475 580 C 470 535, 470 480, 480 430 Z"
              fill={`url(#${p}-cyan-emerald)`}
            />
            <path
              d="M 505 425 C 585 370, 675 358, 770 370 C 855 385, 930 425, 985 470"
              stroke="#67E8F9"
              strokeWidth="5"
              fill="none"
              opacity="0.7"
              strokeLinecap="round"
            />
            <path
              d="M 545 450 C 625 400, 710 395, 795 410 C 870 425, 935 455, 980 495"
              stroke="#86EFAC"
              strokeWidth="4"
              fill="none"
              opacity="0.6"
              strokeLinecap="round"
            />
            <path
              d="M 585 480 C 660 440, 740 435, 820 450 C 885 465, 940 490, 975 520"
              stroke="#BEF264"
              strokeWidth="3.5"
              fill="none"
              opacity="0.5"
              strokeLinecap="round"
            />
          </g>

          {/* Centerpiece Vector Logo Typography - Locked 100% Proportional inside SVG */}
          <g className="animated-logo-svg-text-group" filter={`url(#${p}-text-shadow)`}>
            <text
              x="520"
              y="280"
              textAnchor="middle"
              dominantBaseline="central"
              className="animated-logo-svg-text"
              fill="#FFFFFF"
            >
              {displayTitle}
            </text>
            {subtext && (
              <text
                x="520"
                y="350"
                textAnchor="middle"
                dominantBaseline="central"
                className="animated-logo-svg-subtext"
                fill="#FFFFFF"
                opacity="0.9"
              >
                {subtext}
              </text>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AnimatedLogo;
