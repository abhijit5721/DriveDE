import { cn } from '../../utils/cn';

interface ExamReadinessGaugeProps {
  progress: number; // 0 to 100
  label?: string;
  subLabel?: string;
  className?: string;
}

export function ExamReadinessGauge({ progress, label, subLabel, className }: ExamReadinessGaugeProps) {
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI; // Full circle is 2 * PI * R, half circle is PI * R
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      <svg
        height={radius + 10}
        width={radius * 2}
        className="transform transition-transform duration-500"
      >
        {/* Track */}
        <path
          d={`M ${strokeWidth/2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - strokeWidth/2},${radius}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
          strokeLinecap="round"
        />
        
        {/* Progress with Gradient */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" /> {/* Amber-500 */}
            <stop offset="50%" stopColor="#3b82f6" /> {/* Blue-500 */}
            <stop offset="100%" stopColor="#10b981" /> {/* Emerald-500 */}
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <path
          d={`M ${strokeWidth/2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - strokeWidth/2},${radius}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))' }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute top-[35%] flex flex-col items-center">
        <span className="text-4xl font-black tracking-tighter text-white">
          {progress}%
        </span>
        {label && (
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-100/80">
            {label}
          </span>
        )}
      </div>

      {subLabel && (
        <p className="mt-2 text-sm font-medium text-blue-100">
          {subLabel}
        </p>
      )}
    </div>
  );
}
