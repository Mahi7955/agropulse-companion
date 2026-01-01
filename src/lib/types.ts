export interface FarmerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  createdAt: Date;
}

export interface FarmDetails {
  id: string;
  farmerId: string;
  cropType: string;
  sowingDate: Date;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  farmSize: number;
  farmSizeUnit: 'acres' | 'hectares';
}

export interface CropGrowthStage {
  stage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Harvesting';
  daysSinceSowing: number;
  progress: number;
  nextStage: string;
  daysToNextStage: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
  icon: string;
  windSpeed: number;
  feelsLike: number;
}

export interface WeatherAlert {
  type: 'heatwave' | 'heavy_rain' | 'frost' | 'drought' | 'normal';
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendation: string;
}

export interface IrrigationAdvice {
  timing: string;
  waterQuantity: 'Low' | 'Medium' | 'High';
  fertilizerTiming: string;
  notes: string;
}

export interface CropHealth {
  status: 'Healthy' | 'Moderate' | 'Risk';
  score: number;
  factors: string[];
}

export interface MandiPrice {
  market: string;
  state: string;
  district: string;
  commodity: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
  distance?: number;
}

export interface Expense {
  id: string;
  farmerId: string;
  category: 'seed' | 'fertilizer' | 'labor' | 'pesticide' | 'equipment' | 'other';
  amount: number;
  description: string;
  date: Date;
}

export interface ProfitEstimate {
  totalExpenses: number;
  expectedYield: number;
  expectedRevenue: number;
  profitOrLoss: number;
  isProfitable: boolean;
}
