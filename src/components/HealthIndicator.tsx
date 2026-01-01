import React from 'react';
import { Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { CropHealth } from '@/lib/types';

interface HealthIndicatorProps {
  health: CropHealth;
  showDetails?: boolean;
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({ health, showDetails = true }) => {
  const statusConfig = {
    Healthy: {
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      label: 'Healthy'
    },
    Moderate: {
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      label: 'Moderate'
    },
    Risk: {
      icon: Heart,
      color: 'text-danger',
      bgColor: 'bg-danger/10',
      borderColor: 'border-danger/30',
      label: 'At Risk'
    }
  };

  const config = statusConfig[health.status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl p-4 border-2 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${config.bgColor}`}>
          <Icon className={`${config.color}`} size={28} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-bold text-lg ${config.color}`}>
              {config.label}
            </span>
            <span className={`text-2xl font-bold ${config.color}`}>
              {health.score}%
            </span>
          </div>
          {showDetails && (
            <div className="mt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    health.status === 'Healthy' ? 'bg-success' :
                    health.status === 'Moderate' ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: `${health.score}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {health.factors.map((factor, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 bg-card rounded-full text-muted-foreground"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthIndicator;
