import { cn } from '../../utils/cn';

interface ParkingDiagramProps {
  type: 'parallel' | 'reverse' | 'threepoint' | 'emergency';
  step: number;
  className?: string;
}

export function ParkingDiagram({ type, step, className }: ParkingDiagramProps) {
  return (
    <div className={cn('relative mx-auto aspect-video w-full max-w-[280px]', className)}>
      <svg
        viewBox="0 0 280 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {type === 'parallel' && <ParallelParkingDiagram step={step} />}
        {type === 'reverse' && <ReverseParkingDiagram step={step} />}
        {type === 'threepoint' && <ThreePointTurnDiagram step={step} />}
        {type === 'emergency' && <EmergencyBrakeDiagram step={step} />}
      </svg>
    </div>
  );
}

function ParallelParkingDiagram({ step }: { step: number }) {
  // Calculate car position based on step
  const positions = [
    { x: 200, y: 50, rotate: 0 }, // Step 1: Finding spot
    { x: 160, y: 50, rotate: 0 }, // Step 2: Aligned with front car
    { x: 160, y: 50, rotate: 0 }, // Step 3: Shoulder check
    { x: 145, y: 65, rotate: 25 }, // Step 4: Reversing in
    { x: 125, y: 85, rotate: 45 }, // Step 5: Counter-steer
    { x: 100, y: 95, rotate: 0 }, // Step 6: Straightening
    { x: 100, y: 95, rotate: 0 }, // Step 7: Final position
  ];

  const pos = positions[Math.min(step, positions.length - 1)];

  return (
    <>
      {/* Road */}
      <rect x="0" y="0" width="280" height="160" fill="#e2e8f0" className="dark:fill-slate-700" />
      
      {/* Curb */}
      <rect x="0" y="120" width="280" height="10" fill="#94a3b8" className="dark:fill-slate-600" />
      
      {/* Parking space lines */}
      <line x1="60" y1="95" x2="60" y2="120" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="140" y1="95" x2="140" y2="120" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" />
      
      {/* Front parked car */}
      <rect x="145" y="95" width="35" height="20" rx="4" fill="#64748b" className="dark:fill-slate-500" />
      
      {/* Rear parked car */}
      <rect x="20" y="95" width="35" height="20" rx="4" fill="#64748b" className="dark:fill-slate-500" />
      
      {/* Your car - animated position */}
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotate})`}>
        <rect x="-17" y="-10" width="34" height="20" rx="4" fill="#3b82f6" />
        {/* Direction indicator */}
        {step >= 4 && (
          <path d="M -20 0 L -25 -5 L -25 5 Z" fill="#3b82f6" className="animate-pulse" />
        )}
      </g>
      
      {/* Shoulder check indicator */}
      {step === 2 && (
        <>
          <circle cx={pos.x} cy={pos.y} r="25" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
          <text x={pos.x} y={pos.y - 30} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="bold">
            👀 Schulterblick!
          </text>
        </>
      )}
      
      {/* Step indicators */}
      {step >= 1 && step <= 3 && (
        <circle cx={pos.x} cy={pos.y + 30} r="3" fill="#3b82f6" className="animate-pulse" />
      )}
    </>
  );
}

function ReverseParkingDiagram({ step }: { step: number }) {
  const positions = [
    { x: 100, y: 30, rotate: 0 }, // Step 1: Position
    { x: 100, y: 30, rotate: 0 }, // Step 2: Check
    { x: 100, y: 70, rotate: -20 }, // Step 3: Reversing
    { x: 100, y: 100, rotate: 0 }, // Step 4: Aligned
    { x: 100, y: 115, rotate: 0 }, // Step 5: Complete
  ];

  const pos = positions[Math.min(step, positions.length - 1)];

  return (
    <>
      {/* Parking lot background */}
      <rect x="0" y="0" width="280" height="160" fill="#e2e8f0" className="dark:fill-slate-700" />
      
      {/* Parking bays */}
      <rect x="50" y="80" width="50" height="80" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" className="dark:fill-slate-800" />
      <rect x="100" y="80" width="50" height="80" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" className="dark:fill-slate-800" />
      <rect x="150" y="80" width="50" height="80" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" className="dark:fill-slate-800" />
      
      {/* Adjacent cars */}
      <rect x="55" y="110" width="40" height="25" rx="3" fill="#64748b" className="dark:fill-slate-500" />
      <rect x="155" y="110" width="40" height="25" rx="3" fill="#64748b" className="dark:fill-slate-500" />
      
      {/* Your car */}
      <g transform={`translate(${pos.x + 25}, ${pos.y}) rotate(${pos.rotate})`}>
        <rect x="-15" y="-20" width="30" height="40" rx="4" fill="#3b82f6" />
      </g>
      
      {/* Check indicator */}
      {step === 1 && (
        <text x={pos.x + 25} y={pos.y - 30} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="bold" className="animate-pulse">
          👀 Check!
        </text>
      )}
    </>
  );
}

function ThreePointTurnDiagram({ step }: { step: number }) {
  const positions = [
    { x: 40, y: 80, rotate: 0 }, // Step 1: Check traffic
    { x: 40, y: 80, rotate: 0 }, // Step 2: Signal left
    { x: 150, y: 40, rotate: 45 }, // Step 3: First forward
    { x: 150, y: 40, rotate: 45 }, // Step 4: Stop, check
    { x: 150, y: 120, rotate: -45 }, // Step 5: Reverse
    { x: 240, y: 80, rotate: 180 }, // Step 6: Complete
  ];

  const pos = positions[Math.min(step, positions.length - 1)];

  return (
    <>
      {/* Road */}
      <rect x="0" y="50" width="280" height="60" fill="#94a3b8" className="dark:fill-slate-600" />
      <line x1="0" y1="80" x2="280" y2="80" stroke="#fbbf24" strokeWidth="2" strokeDasharray="10 5" />
      
      {/* Curbs */}
      <rect x="0" y="40" width="280" height="10" fill="#64748b" className="dark:fill-slate-500" />
      <rect x="0" y="110" width="280" height="10" fill="#64748b" className="dark:fill-slate-500" />
      
      {/* Path visualization */}
      {step >= 2 && (
        <path
          d="M 40 80 Q 100 20 150 40"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4 2"
          opacity="0.5"
        />
      )}
      {step >= 4 && (
        <path
          d="M 150 40 Q 170 80 150 120"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4 2"
          opacity="0.5"
        />
      )}
      {step >= 5 && (
        <path
          d="M 150 120 Q 200 100 240 80"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4 2"
          opacity="0.5"
        />
      )}
      
      {/* Your car */}
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotate})`}>
        <rect x="-17" y="-10" width="34" height="20" rx="4" fill="#3b82f6" />
      </g>
      
      {/* Check indicators */}
      {(step === 0 || step === 3) && (
        <text x={pos.x} y={pos.y - 25} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="bold" className="animate-pulse">
          👀
        </text>
      )}
    </>
  );
}

function EmergencyBrakeDiagram({ step }: { step: number }) {
  const positions = [
    { x: 200, y: 80 }, // Step 1: Driving
    { x: 170, y: 80 }, // Step 2: Braking start
    { x: 120, y: 80 }, // Step 3: Mid brake
    { x: 80, y: 80 }, // Step 4: ABS active
    { x: 50, y: 80 }, // Step 5: Stopped
  ];

  const pos = positions[Math.min(step, positions.length - 1)];

  return (
    <>
      {/* Road */}
      <rect x="0" y="50" width="280" height="60" fill="#94a3b8" className="dark:fill-slate-600" />
      <line x1="0" y1="80" x2="280" y2="80" stroke="#fbbf24" strokeWidth="2" strokeDasharray="10 5" />
      
      {/* Danger indicator */}
      <g transform="translate(30, 60)">
        <polygon points="15,0 30,26 0,26" fill="#ef4444" />
        <text x="15" y="20" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">!</text>
      </g>
      
      {/* Brake marks */}
      {step >= 1 && (
        <g opacity={step >= 4 ? 1 : 0.5}>
          <line x1={pos.x + 20} y1="85" x2="220" y2="85" stroke="#1e293b" strokeWidth="3" />
          <line x1={pos.x + 20} y1="75" x2="220" y2="75" stroke="#1e293b" strokeWidth="3" />
        </g>
      )}
      
      {/* Your car */}
      <g transform={`translate(${pos.x}, ${pos.y})`}>
        <rect x="-17" y="-10" width="34" height="20" rx="4" fill="#3b82f6" />
        {/* Brake lights */}
        {step >= 1 && (
          <>
            <rect x="14" y="-6" width="4" height="5" fill="#ef4444" className="animate-pulse" />
            <rect x="14" y="1" width="4" height="5" fill="#ef4444" className="animate-pulse" />
          </>
        )}
      </g>
      
      {/* Speed indicator */}
      <text x="250" y="130" textAnchor="end" fontSize="12" fill="#64748b" fontWeight="bold">
        {step === 0 ? '30 km/h' : step >= 4 ? '0 km/h' : `${30 - step * 8} km/h`}
      </text>
      
      {/* ABS indicator */}
      {step === 3 && (
        <text x="140" y="130" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="bold" className="animate-pulse">
          ABS aktiv!
        </text>
      )}
    </>
  );
}
