import React from 'react';

export const Logo: React.FC<{ className?: string, color?: string }> = ({ className = "h-12 w-12", color = "currentColor" }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Abstract Tower / Drop / Leaf Shape */}
      <path d="M50 5C50 5 20 45 20 65C20 81.5685 33.4315 95 50 95C66.5685 95 80 81.5685 80 65C80 45 50 5 50 5Z" stroke={color} strokeWidth="2"/>
      <path d="M50 15C50 15 28 48 28 65C28 77.1503 37.8497 87 50 87C62.1503 87 72 77.1503 72 65C72 48 50 15 50 15Z" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1"/>
      
      {/* Central Spire/Tower element */}
      <path d="M50 25V85" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M35 65H65" stroke={color} strokeWidth="1" strokeOpacity="0.6"/>
      <path d="M40 50H60" stroke={color} strokeWidth="1" strokeOpacity="0.6"/>
      <path d="M42 75H58" stroke={color} strokeWidth="1" strokeOpacity="0.6"/>
    </svg>
  );
};

export default Logo;