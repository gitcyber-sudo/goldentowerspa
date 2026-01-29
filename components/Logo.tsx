
import React from 'react';

export const Logo: React.FC<{ className?: string, color?: string }> = ({ className = "h-12 w-auto" }) => {
  return (
    <img 
      src="/logo.png" 
      alt="Golden Tower Spa Logo" 
      className={className}
      loading="eager"
    />
  );
};

export default Logo;
