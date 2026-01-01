import React from 'react';
import { Cloud, Droplets, Wind, Thermometer, Sun } from 'lucide-react';
import { WeatherData, WeatherAlert } from '@/lib/types';

interface WeatherCardProps {
  weather: WeatherData;
  alert: WeatherAlert;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, alert }) => {
  const alertStyles = {
    heatwave: 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30',
    heavy_rain: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    frost: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    drought: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30',
    normal: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'
  };

  return (
    <div className="agro-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sun className="text-accent" size={24} />
          Weather Today
        </h3>
        <span className="text-sm text-muted-foreground">{weather.description}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
          <Thermometer className="text-danger" size={28} />
          <div>
            <p className="text-2xl font-bold">{weather.temperature}°C</p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
          <Droplets className="text-primary" size={28} />
          <div>
            <p className="text-2xl font-bold">{weather.humidity}%</p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
          <Cloud className="text-blue-500" size={28} />
          <div>
            <p className="text-2xl font-bold">{weather.rainfall}mm</p>
            <p className="text-xs text-muted-foreground">Rainfall</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
          <Wind className="text-muted-foreground" size={28} />
          <div>
            <p className="text-2xl font-bold">{weather.windSpeed}km/h</p>
            <p className="text-xs text-muted-foreground">Wind</p>
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      <div className={`p-4 rounded-xl border-2 ${alertStyles[alert.type]}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${
            alert.severity === 'high' ? 'bg-danger/20' :
            alert.severity === 'medium' ? 'bg-warning/20' : 'bg-success/20'
          }`}>
            {alert.type === 'heatwave' && <Thermometer className="text-danger" size={20} />}
            {alert.type === 'heavy_rain' && <Cloud className="text-blue-500" size={20} />}
            {alert.type === 'frost' && <Wind className="text-cyan-500" size={20} />}
            {alert.type === 'drought' && <Sun className="text-amber-500" size={20} />}
            {alert.type === 'normal' && <Sun className="text-success" size={20} />}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{alert.message}</p>
            <p className="text-sm text-muted-foreground mt-1">{alert.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
