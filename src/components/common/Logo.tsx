
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
      className={cn(sizeClasses[size], 'object-contain', className)}
    />
  );
}
