import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultLogoImg from '../assets/logo.png';

interface BrandingContextType {
  schoolName: string;
  tagline: string;
  customLogoUrl: string | null;
  activeLogo: string;
  updateSchoolName: (name: string) => void;
  updateTagline: (tagline: string) => void;
  updateLogo: (dataUrl: string) => void;
  resetLogo: () => void;
  resetAllBranding: () => void;
}

const DEFAULT_SCHOOL_NAME = 'Ever Grow Schools';
const DEFAULT_TAGLINE = 'Excellence in Holistic Education';

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolName, setSchoolName] = useState<string>(() => {
    try {
      return localStorage.getItem('evergrow_school_name') || DEFAULT_SCHOOL_NAME;
    } catch {
      return DEFAULT_SCHOOL_NAME;
    }
  });

  const [tagline, setTagline] = useState<string>(() => {
    try {
      return localStorage.getItem('evergrow_tagline') || DEFAULT_TAGLINE;
    } catch {
      return DEFAULT_TAGLINE;
    }
  });

  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('evergrow_custom_logo') || null;
    } catch {
      return null;
    }
  });

  const updateSchoolName = (name: string) => {
    setSchoolName(name);
    try {
      localStorage.setItem('evergrow_school_name', name);
    } catch {}
  };

  const updateTagline = (newTagline: string) => {
    setTagline(newTagline);
    try {
      localStorage.setItem('evergrow_tagline', newTagline);
    } catch {}
  };

  const updateLogo = (dataUrl: string) => {
    setCustomLogoUrl(dataUrl);
    try {
      localStorage.setItem('evergrow_custom_logo', dataUrl);
    } catch {}
  };

  const resetLogo = () => {
    setCustomLogoUrl(null);
    try {
      localStorage.removeItem('evergrow_custom_logo');
    } catch {}
  };

  const resetAllBranding = () => {
    setSchoolName(DEFAULT_SCHOOL_NAME);
    setTagline(DEFAULT_TAGLINE);
    setCustomLogoUrl(null);
    try {
      localStorage.removeItem('evergrow_school_name');
      localStorage.removeItem('evergrow_tagline');
      localStorage.removeItem('evergrow_custom_logo');
    } catch {}
  };

  return (
    <BrandingContext.Provider
      value={{
        schoolName,
        tagline,
        customLogoUrl,
        activeLogo: customLogoUrl || defaultLogoImg,
        updateSchoolName,
        updateTagline,
        updateLogo,
        resetLogo,
        resetAllBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

