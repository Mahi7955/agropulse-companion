import React from 'react';
import { MapPin, TrendingUp, TrendingDown, Star, Navigation } from 'lucide-react';
import { MandiPrice } from '@/lib/types';
import { Button } from './ui/button';

interface MandiPriceCardProps {
  prices: MandiPrice[];
  onViewDetails?: () => void;
}

const MandiPriceCard: React.FC<MandiPriceCardProps> = ({ prices, onViewDetails }) => {
  if (prices.length === 0) return null;

  // Find best market (highest modal price with reasonable distance)
  const bestMarket = prices.reduce((best, current) => {
    const bestScore = best.modalPrice - (best.distance || 0) * 10;
    const currentScore = current.modalPrice - (current.distance || 0) * 10;
    return currentScore > bestScore ? current : best;
  }, prices[0]);

  return (
    <div className="agro-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="text-success" size={24} />
          Market Prices
        </h3>
        <span className="text-sm text-muted-foreground">{prices[0]?.commodity}</span>
      </div>

      {/* Best Market Recommendation */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="text-accent fill-accent" size={20} />
          <span className="font-semibold text-primary">Best Market Today</span>
        </div>
        <p className="text-lg font-bold">{bestMarket.market}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp size={16} className="text-success" />
            ₹{bestMarket.modalPrice}/quintal
          </span>
          <span className="flex items-center gap-1">
            <Navigation size={16} />
            {bestMarket.distance}km away
          </span>
        </div>
      </div>

      {/* Price List */}
      <div className="space-y-3">
        {prices.slice(0, 4).map((price, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-3 rounded-xl ${
              price.market === bestMarket.market 
                ? 'bg-primary/5 border border-primary/20' 
                : 'bg-secondary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{price.market}</p>
                <p className="text-xs text-muted-foreground">{price.district}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">₹{price.modalPrice}</p>
              <p className="text-xs text-muted-foreground">
                ₹{price.minPrice} - ₹{price.maxPrice}
              </p>
            </div>
          </div>
        ))}
      </div>

      {onViewDetails && (
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={onViewDetails}
        >
          View All Markets & Trends
        </Button>
      )}
    </div>
  );
};

export default MandiPriceCard;
