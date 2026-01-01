import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardNav from '@/components/DashboardNav';
import WeatherCard from '@/components/WeatherCard';
import GrowthStageCard from '@/components/GrowthStageCard';
import HealthIndicator from '@/components/HealthIndicator';
import IrrigationAdviceCard from '@/components/IrrigationAdviceCard';
import MandiPriceCard from '@/components/MandiPriceCard';
import AIAdvisor from '@/components/AIAdvisor';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWeatherData } from '@/lib/weatherApi';
import { 
  calculateGrowthStage, 
  analyzeWeatherRisks, 
  getIrrigationAdvice, 
  calculateCropHealth,
  generateMockMandiPrices 
} from '@/lib/mockData';
import { WeatherData, CropGrowthStage, WeatherAlert, IrrigationAdvice, CropHealth, MandiPrice } from '@/lib/types';

const Dashboard: React.FC = () => {
  const { user, farmDetails, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [growthStage, setGrowthStage] = useState<CropGrowthStage | null>(null);
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [irrigationAdvice, setIrrigationAdvice] = useState<IrrigationAdvice | null>(null);
  const [cropHealth, setCropHealth] = useState<CropHealth | null>(null);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (!authLoading && user && !farmDetails) {
      navigate('/register');
    }
  }, [user, farmDetails, authLoading, navigate]);

  useEffect(() => {
    if (farmDetails && user) {
      loadDashboardData();
    }
  }, [farmDetails, user]);

  const loadDashboardData = async () => {
    if (!farmDetails || !user) return;
    
    setIsRefreshing(true);
    
    try {
      // Fetch weather
      const weatherData = await fetchWeatherData(user.latitude, user.longitude);
      setWeather(weatherData);
      
      // Calculate growth stage
      const stage = calculateGrowthStage(farmDetails.sowingDate, farmDetails.cropType);
      setGrowthStage(stage);
      
      // Analyze weather risks
      const alert = analyzeWeatherRisks(weatherData);
      setWeatherAlert(alert);
      
      // Get irrigation advice
      const advice = getIrrigationAdvice(weatherData, stage.stage, farmDetails.cropType);
      setIrrigationAdvice(advice);
      
      // Calculate crop health
      const health = calculateCropHealth(weatherData, stage, alert);
      setCropHealth(health);
      
      // Get mandi prices
      const prices = generateMockMandiPrices(farmDetails.cropType, user.state || 'Maharashtra');
      setMandiPrices(prices);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (authLoading || !farmDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Leaf className="animate-bounce mx-auto text-primary" size={48} />
          <p className="mt-4 text-muted-foreground">Loading AgroPulse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Main Content */}
      <main className="lg:ml-72 pt-20 lg:pt-6 pb-8 px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              {farmDetails.cropType} • {farmDetails.season} Season • {user?.district}, {user?.state}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadDashboardData}
            disabled={isRefreshing}
          >
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={18} />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Crop Health - Full Width on Mobile */}
          {cropHealth && (
            <div className="lg:col-span-2 xl:col-span-1">
              <HealthIndicator health={cropHealth} />
            </div>
          )}

          {/* Growth Stage */}
          {growthStage && (
            <div className="lg:col-span-1">
              <GrowthStageCard growthStage={growthStage} cropType={farmDetails.cropType} />
            </div>
          )}

          {/* Weather Card */}
          {weather && weatherAlert && (
            <div className="lg:col-span-2 xl:col-span-1">
              <WeatherCard weather={weather} alert={weatherAlert} />
            </div>
          )}

          {/* Irrigation Advice */}
          {irrigationAdvice && (
            <div className="lg:col-span-2 xl:col-span-2">
              <IrrigationAdviceCard advice={irrigationAdvice} />
            </div>
          )}

          {/* Mandi Prices */}
          <div className="lg:col-span-1">
            <MandiPriceCard 
              prices={mandiPrices} 
              onViewDetails={() => navigate('/markets')}
            />
          </div>

          {/* AI Advisor */}
          <div className="lg:col-span-2 xl:col-span-3">
            <AIAdvisor
              cropType={farmDetails.cropType}
              growthStage={growthStage?.stage || 'Seedling'}
              weather={weather || { temperature: 30, humidity: 60, rainfall: 0 }}
              modalPrice={mandiPrices[0]?.modalPrice || 2000}
            />
          </div>
        </div>

        {/* Sustainability Tips */}
        <div className="mt-6 agro-card bg-gradient-to-r from-primary/5 to-accent/5">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            🌱 Sustainability Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card/50 rounded-lg p-3">
              <p className="font-medium text-primary">💧 Water Conservation</p>
              <p className="text-sm text-muted-foreground">Use drip irrigation to save up to 40% water</p>
            </div>
            <div className="bg-card/50 rounded-lg p-3">
              <p className="font-medium text-primary">🧪 Reduced Fertilizer</p>
              <p className="text-sm text-muted-foreground">Apply fertilizer based on soil test results</p>
            </div>
            <div className="bg-card/50 rounded-lg p-3">
              <p className="font-medium text-primary">🐛 Natural Pest Control</p>
              <p className="text-sm text-muted-foreground">Use neem-based solutions for organic farming</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
