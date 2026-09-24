// 256 px WebP (22 KB) instead of the 588 px PNG (117 KB): the logo is shown at
// 28 to 96 px, so 256 px stays sharp on 3x screens. Source: assets/logo.png.
import logoImg from '../../assets/logo-256.webp';
import { cn } from '../../utils/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <img
      src={logoImg}
      alt="DriveDE Logo"
      className={cn(
        sizeClasses[size],
        'object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-all',
        className
      )}
    />
  );
}
