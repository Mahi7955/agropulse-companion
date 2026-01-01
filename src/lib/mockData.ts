import { MandiPrice, WeatherData, WeatherAlert, CropGrowthStage, IrrigationAdvice, CropHealth } from './types';

export const cropTypes = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Groundnut', 
  'Tomato', 'Potato', 'Onion', 'Chilli', 'Mustard', 'Sunflower', 'Pulses'
];

export const indianStates = [
  'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 
  'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal'
];

export const stateDistricts: Record<string, string[]> = {
  'Andhra Pradesh': ['Guntur', 'Krishna', 'East Godavari', 'West Godavari', 'Visakhapatnam'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Haryana': ['Karnal', 'Hisar', 'Sirsa', 'Rohtak', 'Panipat'],
  'Karnataka': ['Bangalore', 'Mysore', 'Belgaum', 'Hubli', 'Dharwad'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Maharashtra': ['Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Kolhapur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tirupur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri']
};

export const cropGrowthDays: Record<string, { seedling: number; vegetative: number; flowering: number; harvesting: number }> = {
  'Rice': { seedling: 20, vegetative: 55, flowering: 85, harvesting: 120 },
  'Wheat': { seedling: 15, vegetative: 45, flowering: 75, harvesting: 120 },
  'Maize': { seedling: 15, vegetative: 40, flowering: 65, harvesting: 100 },
  'Cotton': { seedling: 25, vegetative: 60, flowering: 100, harvesting: 180 },
  'Sugarcane': { seedling: 35, vegetative: 120, flowering: 270, harvesting: 360 },
  'Soybean': { seedling: 15, vegetative: 35, flowering: 60, harvesting: 100 },
  'Groundnut': { seedling: 15, vegetative: 40, flowering: 70, harvesting: 110 },
  'Tomato': { seedling: 20, vegetative: 40, flowering: 60, harvesting: 90 },
  'Potato': { seedling: 15, vegetative: 40, flowering: 60, harvesting: 90 },
  'Onion': { seedling: 20, vegetative: 50, flowering: 80, harvesting: 120 },
  'Chilli': { seedling: 25, vegetative: 50, flowering: 75, harvesting: 120 },
  'Mustard': { seedling: 15, vegetative: 40, flowering: 70, harvesting: 110 },
  'Sunflower': { seedling: 15, vegetative: 40, flowering: 65, harvesting: 95 },
  'Pulses': { seedling: 15, vegetative: 35, flowering: 55, harvesting: 90 }
};

export const generateMockMandiPrices = (crop: string, state: string): MandiPrice[] => {
  const districts = stateDistricts[state] || ['District 1', 'District 2'];
  const basePrice = Math.floor(Math.random() * 3000) + 1500;
  
  return districts.slice(0, 4).map((district, index) => ({
    market: `APMC ${district}`,
    state,
    district,
    commodity: crop,
    minPrice: basePrice - Math.floor(Math.random() * 200),
    maxPrice: basePrice + Math.floor(Math.random() * 300),
    modalPrice: basePrice + Math.floor(Math.random() * 100),
    date: new Date().toISOString().split('T')[0],
    distance: Math.floor(Math.random() * 50) + 5
  }));
};

export const calculateGrowthStage = (sowingDate: Date, cropType: string): CropGrowthStage => {
  const today = new Date();
  const daysSinceSowing = Math.floor((today.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
  const growthDays = cropGrowthDays[cropType] || cropGrowthDays['Rice'];
  
  let stage: CropGrowthStage['stage'];
  let progress: number;
  let nextStage: string;
  let daysToNextStage: number;

  if (daysSinceSowing <= growthDays.seedling) {
    stage = 'Seedling';
    progress = (daysSinceSowing / growthDays.seedling) * 100;
    nextStage = 'Vegetative';
    daysToNextStage = growthDays.seedling - daysSinceSowing;
  } else if (daysSinceSowing <= growthDays.vegetative) {
    stage = 'Vegetative';
    progress = ((daysSinceSowing - growthDays.seedling) / (growthDays.vegetative - growthDays.seedling)) * 100;
    nextStage = 'Flowering';
    daysToNextStage = growthDays.vegetative - daysSinceSowing;
  } else if (daysSinceSowing <= growthDays.flowering) {
    stage = 'Flowering';
    progress = ((daysSinceSowing - growthDays.vegetative) / (growthDays.flowering - growthDays.vegetative)) * 100;
    nextStage = 'Harvesting';
    daysToNextStage = growthDays.flowering - daysSinceSowing;
  } else {
    stage = 'Harvesting';
    progress = Math.min(((daysSinceSowing - growthDays.flowering) / (growthDays.harvesting - growthDays.flowering)) * 100, 100);
    nextStage = 'Harvest Complete';
    daysToNextStage = Math.max(growthDays.harvesting - daysSinceSowing, 0);
  }

  return { stage, daysSinceSowing, progress: Math.min(progress, 100), nextStage, daysToNextStage };
};

export const analyzeWeatherRisks = (weather: WeatherData): WeatherAlert => {
  if (weather.temperature > 40) {
    return {
      type: 'heatwave',
      severity: 'high',
      message: 'Extreme heat warning!',
      recommendation: 'Increase irrigation frequency. Provide shade if possible. Water during early morning or evening.'
    };
  }
  if (weather.temperature > 35) {
    return {
      type: 'heatwave',
      severity: 'medium',
      message: 'High temperature alert',
      recommendation: 'Increase watering. Monitor crop for heat stress signs.'
    };
  }
  if (weather.rainfall > 50) {
    return {
      type: 'heavy_rain',
      severity: 'high',
      message: 'Heavy rain expected',
      recommendation: 'Delay irrigation. Ensure proper drainage. Postpone fertilizer application.'
    };
  }
  if (weather.rainfall > 20) {
    return {
      type: 'heavy_rain',
      severity: 'medium',
      message: 'Rain expected',
      recommendation: 'Delay irrigation for 2-3 days. Check for waterlogging.'
    };
  }
  if (weather.temperature < 5) {
    return {
      type: 'frost',
      severity: 'high',
      message: 'Frost warning!',
      recommendation: 'Cover sensitive crops. Water soil before sunset to retain heat.'
    };
  }
  if (weather.humidity < 30 && weather.rainfall === 0) {
    return {
      type: 'drought',
      severity: 'medium',
      message: 'Dry conditions',
      recommendation: 'Increase irrigation. Consider mulching to retain soil moisture.'
    };
  }
  
  return {
    type: 'normal',
    severity: 'low',
    message: 'Weather conditions are favorable',
    recommendation: 'Continue normal farming activities. Maintain regular irrigation schedule.'
  };
};

export const getIrrigationAdvice = (
  weather: WeatherData, 
  growthStage: CropGrowthStage['stage'], 
  cropType: string
): IrrigationAdvice => {
  const baseAdvice: Record<CropGrowthStage['stage'], { timing: string; water: 'Low' | 'Medium' | 'High'; fertilizer: string }> = {
    'Seedling': { timing: 'Light watering twice daily', water: 'Low', fertilizer: 'Apply starter fertilizer after 7 days' },
    'Vegetative': { timing: 'Deep watering every 3-4 days', water: 'Medium', fertilizer: 'Apply nitrogen-rich fertilizer' },
    'Flowering': { timing: 'Consistent moisture, water every 2-3 days', water: 'High', fertilizer: 'Apply phosphorus-rich fertilizer' },
    'Harvesting': { timing: 'Reduce watering gradually', water: 'Low', fertilizer: 'Stop fertilizer application' }
  };

  const advice = baseAdvice[growthStage];
  let adjustedWater = advice.water;
  let notes = '';

  if (weather.temperature > 35) {
    adjustedWater = 'High';
    notes = 'Increased water due to high temperature. ';
  }
  if (weather.rainfall > 10) {
    adjustedWater = 'Low';
    notes += 'Reduced water due to rainfall. ';
  }
  if (weather.humidity < 40) {
    notes += 'Low humidity - consider misting for sensitive crops. ';
  }

  return {
    timing: advice.timing,
    waterQuantity: adjustedWater,
    fertilizerTiming: advice.fertilizer,
    notes: notes || 'Conditions normal. Follow standard schedule.'
  };
};

export const calculateCropHealth = (
  weather: WeatherData,
  growthStage: CropGrowthStage,
  alert: WeatherAlert
): CropHealth => {
  let score = 100;
  const factors: string[] = [];

  // Weather factors
  if (weather.temperature > 38) {
    score -= 25;
    factors.push('Heat stress risk');
  } else if (weather.temperature > 35) {
    score -= 10;
    factors.push('Moderate heat');
  }

  if (weather.humidity > 85) {
    score -= 15;
    factors.push('Disease risk from high humidity');
  } else if (weather.humidity < 30) {
    score -= 10;
    factors.push('Low humidity stress');
  }

  if (weather.rainfall > 50) {
    score -= 20;
    factors.push('Waterlogging risk');
  }

  // Alert severity
  if (alert.severity === 'high') {
    score -= 20;
  } else if (alert.severity === 'medium') {
    score -= 10;
  }

  // Growth stage adjustments
  if (growthStage.stage === 'Flowering' && (weather.temperature > 35 || weather.rainfall > 30)) {
    score -= 15;
    factors.push('Critical flowering stage at risk');
  }

  if (factors.length === 0) {
    factors.push('All conditions favorable');
  }

  let status: CropHealth['status'];
  if (score >= 70) {
    status = 'Healthy';
  } else if (score >= 40) {
    status = 'Moderate';
  } else {
    status = 'Risk';
  }

  return { status, score: Math.max(0, score), factors };
};

export const generatePriceTrend = (basePrice: number, days: number): { date: string; price: number }[] => {
  const trend: { date: string; price: number }[] = [];
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some variation
    const variation = (Math.random() - 0.5) * 100;
    currentPrice = Math.max(basePrice - 200, Math.min(basePrice + 300, currentPrice + variation));
    
    trend.push({
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      price: Math.round(currentPrice)
    });
  }
  
  return trend;
};
