
import React from 'react';

export const Logo: React.FC<{ className?: string, color?: string }> = ({ className = "h-12 w-auto", color = "currentColor" }) => {
  return (
    <svg 
      viewBox="0 0 200 420" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path 
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M100 2L103 25H108L112 45H88L92 25H97L100 2ZM90 55L82 135H118L110 55H90ZM76 145L64 230H136L124 145H76ZM56 240L35 390H55C55 390 58 330 100 330C142 330 145 390 145 390H165L144 240H56ZM90 170H110L115 210H85L90 170ZM25 390L20 415H60L55 390H25ZM175 390L180 415H140L145 390H175Z"
      />
    </svg>
  );
};

export default Logo;
