import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Filter,
  Bell,
  Star,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardNav from '@/components/DashboardNav';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { generateMockMandiPrices, generatePriceTrend, cropTypes, indianStates } from '@/lib/mockData';
import { MandiPrice } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Markets: React.FC = () => {
  const { user, farmDetails } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [selectedCrop, setSelectedCrop] = useState(farmDetails?.cropType || 'Rice');
  const [selectedState, setSelectedState] = useState(user?.state || 'Maharashtra');
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [priceTrend, setPriceTrend] = useState<{ date: string; price: number }[]>([]);
  const [trendDays, setTrendDays] = useState(7);
  const [targetPrice, setTargetPrice] = useState('');
  const [priceAlertSet, setPriceAlertSet] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadPrices();
  }, [selectedCrop, selectedState]);

  useEffect(() => {
    if (prices.length > 0) {
      const trend = generatePriceTrend(prices[0].modalPrice, trendDays);
      setPriceTrend(trend);
    }
  }, [prices, trendDays]);

  const loadPrices = () => {
    const newPrices = generateMockMandiPrices(selectedCrop, selectedState);
    setPrices(newPrices);
  };

  const bestMarket = prices.length > 0 ? prices.reduce((best, current) => {
    const bestScore = best.modalPrice - (best.distance || 0) * 10;
    const currentScore = current.modalPrice - (current.distance || 0) * 10;
    return currentScore > bestScore ? current : best;
  }, prices[0]) : null;

  const handleSetPriceAlert = () => {
    if (!targetPrice || isNaN(Number(targetPrice))) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid target price',
        variant: 'destructive',
      });
      return;
    }

    setPriceAlertSet(true);
    toast({
      title: 'Price alert set!',
      description: `You'll be notified when ${selectedCrop} reaches ₹${targetPrice}/quintal`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      <main className="lg:ml-72 pt-20 lg:pt-6 pb-8 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Market Prices
          </h1>
          <p className="text-muted-foreground">Track mandi prices and find the best market to sell</p>
        </div>

        {/* Filters */}
        <div className="agro-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-muted-foreground" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Crop</label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Best Market Recommendation */}
          {bestMarket && (
            <div className="lg:col-span-3">
              <div className="agro-card bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="text-accent fill-accent" size={28} />
                  <div>
                    <h2 className="text-xl font-bold">Best Market to Sell Today</h2>
                    <p className="text-muted-foreground">Based on price and distance analysis</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-2xl font-bold text-primary">{bestMarket.market}</p>
                    <p className="text-muted-foreground">{bestMarket.district}, {bestMarket.state}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-success/10 px-4 py-2 rounded-xl">
                    <TrendingUp className="text-success" size={24} />
                    <div>
                      <p className="text-2xl font-bold text-success">₹{bestMarket.modalPrice}</p>
                      <p className="text-xs text-muted-foreground">per quintal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-xl">
                    <MapPin className="text-muted-foreground" size={20} />
                    <p className="font-medium">{bestMarket.distance}km away</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price List */}
          <div className="lg:col-span-2">
            <div className="agro-card">
              <h3 className="font-semibold text-lg mb-4">All Markets in {selectedState}</h3>
              <div className="space-y-3">
                {prices.map((price, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      price.market === bestMarket?.market 
                        ? 'bg-primary/10 border-2 border-primary/30' 
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-card rounded-lg">
                        <MapPin size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {price.market}
                          {price.market === bestMarket?.market && (
                            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                              Best
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {price.district} • {price.distance}km
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">₹{price.modalPrice}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{price.minPrice} - ₹{price.maxPrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price Alert */}
          <div className="lg:col-span-1">
            <div className="agro-card mb-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Bell className="text-accent" size={20} />
                Set Price Alert
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get notified when {selectedCrop} reaches your target price
              </p>
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Target price (₹/quintal)"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
                <Button 
                  onClick={handleSetPriceAlert}
                  className="w-full"
                  disabled={priceAlertSet}
                >
                  {priceAlertSet ? 'Alert Set ✓' : 'Set Alert'}
                </Button>
              </div>
            </div>

            {/* Trend Period Selection */}
            <div className="agro-card">
              <h3 className="font-semibold text-lg mb-4">Price Trend</h3>
              <div className="flex gap-2 mb-4">
                {[7, 15, 30].map((days) => (
                  <Button
                    key={days}
                    variant={trendDays === days ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setTrendDays(days)}
                  >
                    {days} Days
                  </Button>
                ))}
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Markets;
