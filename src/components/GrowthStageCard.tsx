import React from 'react';
import { Sprout, Leaf, Flower2, Wheat, ArrowRight } from 'lucide-react';
import { CropGrowthStage } from '@/lib/types';

interface GrowthStageCardProps {
  growthStage: CropGrowthStage;
  cropType: string;
}

const GrowthStageCard: React.FC<GrowthStageCardProps> = ({ growthStage, cropType }) => {
  const stageIcons = {
    Seedling: Sprout,
    Vegetative: Leaf,
    Flowering: Flower2,
    Harvesting: Wheat
  };

  const stageColors = {
    Seedling: 'from-green-400 to-green-600',
    Vegetative: 'from-green-500 to-emerald-600',
    Flowering: 'from-pink-400 to-rose-500',
    Harvesting: 'from-amber-400 to-orange-500'
  };

  const stages: CropGrowthStage['stage'][] = ['Seedling', 'Vegetative', 'Flowering', 'Harvesting'];
  const currentIndex = stages.indexOf(growthStage.stage);
  const Icon = stageIcons[growthStage.stage];

  return (
    <div className="agro-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Crop Growth Stage</h3>
        <span className="text-sm text-muted-foreground">{cropType}</span>
      </div>

      {/* Current Stage Display */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${stageColors[growthStage.stage]} shadow-lg`}>
          <Icon className="text-white" size={36} />
        </div>
        <div>
          <p className="text-2xl font-bold">{growthStage.stage}</p>
          <p className="text-muted-foreground">Day {growthStage.daysSinceSowing} since sowing</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Stage Progress</span>
          <span className="font-semibold">{Math.round(growthStage.progress)}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${stageColors[growthStage.stage]} transition-all duration-1000`}
            style={{ width: `${growthStage.progress}%` }}
          />
        </div>
      </div>

      {/* Stage Timeline */}
      <div className="flex items-center justify-between mb-4">
        {stages.map((stage, index) => {
          const StageIcon = stageIcons[stage];
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full transition-all ${
                  isActive ? `bg-gradient-to-br ${stageColors[stage]} shadow-lg scale-110` :
                  isPast ? 'bg-primary/20' : 'bg-secondary'
                }`}>
                  <StageIcon 
                    size={20} 
                    className={isActive ? 'text-white' : isPast ? 'text-primary' : 'text-muted-foreground'} 
                  />
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                  {stage.slice(0, 4)}
                </span>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight size={16} className="text-muted-foreground -mt-4" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Next Stage Info */}
      <div className="bg-secondary/50 rounded-xl p-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Next: {growthStage.nextStage}</span>
        <span className="text-sm font-semibold text-primary">
          {growthStage.daysToNextStage > 0 ? `${growthStage.daysToNextStage} days` : 'Ready!'}
        </span>
      </div>
    </div>
  );
};

export default GrowthStageCard;
