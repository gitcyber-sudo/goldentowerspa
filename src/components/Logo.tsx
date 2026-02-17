
import React from 'react';

export const Logo: React.FC<{ className?: string, color?: string }> = ({ className = "h-12 w-auto", color = "#997B3D" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill={color}
    >
      <path d="M12,2L11.5,5.5H12.5L12,2ZM11.4,6.5L11,10.5H13L12.6,6.5H11.4ZM11.1,11.5L10,17H14L12.9,11.5H11.1ZM9.1,18.5L7.5,22H10.1C10.1,22 10.3,20.5 12,20.5C13.7,20.5 13.9,22 13.9,22H16.5L14.9,18.5H9.1ZM12,13.5H12C12,13.5 11,13.5 11,14.5C11,15.5 12,15.5 12,15.5H12V13.5ZM6.5,22L6,24.5H9L8.5,22H6.5ZM17.5,22L18,24.5H15L15.5,22H17.5Z" />
    </svg>
  );
};

export default Logo;
