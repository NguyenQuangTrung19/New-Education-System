import React from 'react';

interface SchoolLogoProps {
  className?: string; // e.g. w-8 h-8
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ className = 'w-12 h-12' }) => {
  return (
    <img 
      src="/LogoNewEdu.png" 
      alt="School Logo" 
      className={`object-contain scale-[1.25] ${className}`}
    />
  );
};

export default SchoolLogo;
