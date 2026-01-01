import React from 'react';
import { Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSize = {
    sm: 24,
    md: 32,
    lg: 48
  };

  const textSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse-soft" />
        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg">
          <Leaf className="text-primary-foreground" size={iconSize[size]} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold agro-gradient-text ${textSize[size]}`}>
            AgroPulse
          </span>
          {size === 'lg' && (
            <span className="text-sm text-muted-foreground -mt-1">
              Smart Farming, Better Yields
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
