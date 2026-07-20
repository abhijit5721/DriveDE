
import logoImg from '../../assets/logo.png';
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
        'object-contain drop-shadow-[0_2px_6px_rgba(15,23,42,0.18)] dark:drop-shadow-[0_0_10px_rgba(96,165,250,0.4)] transition-all',
        className
      )}
    />
  );
}
