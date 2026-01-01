import React from 'react';
import { Droplets, Clock, Beaker, Lightbulb } from 'lucide-react';
import { IrrigationAdvice } from '@/lib/types';

interface IrrigationAdviceCardProps {
  advice: IrrigationAdvice;
}

const IrrigationAdviceCard: React.FC<IrrigationAdviceCardProps> = ({ advice }) => {
  const waterQuantityColors = {
    Low: 'text-blue-400 bg-blue-400/20',
    Medium: 'text-blue-500 bg-blue-500/20',
    High: 'text-blue-600 bg-blue-600/20'
  };

  return (
    <div className="agro-card">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Droplets className="text-primary" size={24} />
        Smart Irrigation Advisory
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-primary" size={20} />
            <span className="text-sm font-medium">Timing</span>
          </div>
          <p className="text-sm text-foreground">{advice.timing}</p>
        </div>

        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="text-primary" size={20} />
            <span className="text-sm font-medium">Water Quantity</span>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${waterQuantityColors[advice.waterQuantity]}`}>
            {advice.waterQuantity}
          </span>
        </div>

        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Beaker className="text-accent" size={20} />
            <span className="text-sm font-medium">Fertilizer</span>
          </div>
          <p className="text-sm text-foreground">{advice.fertilizerTiming}</p>
        </div>
      </div>

      {advice.notes && (
        <div className="flex items-start gap-3 bg-accent/10 border border-accent/30 rounded-xl p-4">
          <Lightbulb className="text-accent flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-foreground">{advice.notes}</p>
        </div>
      )}
    </div>
  );
};

export default IrrigationAdviceCard;
