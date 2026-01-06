import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  MapPin, 
  Filter,
  Bell,
  Star,
  Loader2,
  RefreshCw,
  AlertCircle,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardNav from '@/components/DashboardNav';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface APMCPrice {
  id: string;
  market: string;
  district: string;
  state: string;
  commodity: string;
  variety: string;
  grade: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  arrivalDate: string;
}

interface FilterOptions {
  districts: string[];
  markets: string[];
  commodities: string[];
}

const AUTO_REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const Markets: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    districts: [],
    markets: [],
    commodities: [],
  });
  
  const [prices, setPrices] = useState<APMCPrice[]>([]);
  const [targetPrice, setTargetPrice] = useState('');
  const [priceAlertSet, setPriceAlertSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bestMarketRecommendation, setBestMarketRecommendation] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoadingCSV, setIsLoadingCSV] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('mandi-prices', {
        body: { 
          district: selectedDistrict,
          market: selectedMarket,
          commodity: selectedCommodity,
        }
      });

      if (fnError) {
        console.error('Mandi prices error:', fnError);
        setError('Failed to load market prices. Please try again.');
        setPrices([]);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setPrices([]);
        return;
      }

      if (data?.prices) {
        setPrices(data.prices);
      }

      if (data?.filterOptions) {
        setFilterOptions(data.filterOptions);
      }

      if (data?.bestMarket) {
        setBestMarketRecommendation(data.bestMarket.recommendation);
      }

      if (data?.lastUpdated) {
        setLastUpdated(data.lastUpdated);
      }
    } catch (err) {
      console.error('Failed to load prices:', err);
      setError('Failed to connect to the server. Please check your connection.');
      setPrices([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDistrict, selectedMarket, selectedCommodity]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  // Auto-refresh every 6 hours
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing APMC data...');
      loadPrices();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loadPrices]);

  const handleLoadCSV = async () => {
    setIsLoadingCSV(true);
    setError(null);

    try {
      // Fetch CSV from public folder
      const response = await fetch('/data/karnataka-apmc-prices.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }
      
      const csvContent = await response.text();
      
      // Send to edge function
      const { data, error: fnError } = await supabase.functions.invoke('load-apmc-data', {
        body: { csvContent }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'CSV Data Loaded',
        description: data?.message || 'Successfully loaded APMC price data',
      });

      // Reload prices
      await loadPrices();
    } catch (err) {
      console.error('Failed to load CSV:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load CSV data';
      setError(errorMessage);
      toast({
        title: 'Error Loading CSV',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCSV(false);
    }
  };

  const bestMarket = prices.length > 0 ? prices.reduce((best, current) => 
    current.modalPrice > best.modalPrice ? current : best
  , prices[0]) : null;

  const handleSetPriceAlert = async () => {
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
      description: `You'll be notified when price reaches ₹${targetPrice}/quintal`,
    });
  };

  // Filter markets based on selected district
  const availableMarkets = selectedDistrict === 'all' 
    ? filterOptions.markets 
    : [...new Set(prices.filter(p => p.district === selectedDistrict).map(p => p.market))];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      <main className="lg:ml-72 pt-20 lg:pt-6 pb-8 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="text-primary" />
                Karnataka APMC Prices
                <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full ml-2">Live Data</span>
              </h1>
              <p className="text-muted-foreground">Real market prices from Karnataka APMC markets</p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadPrices}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleLoadCSV}
                disabled={isLoadingCSV}
              >
                {isLoadingCSV ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Load CSV Data
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="agro-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-muted-foreground" />
            <span className="font-medium">Filters</span>
            {isLoading && <Loader2 className="animate-spin ml-2" size={16} />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">District</label>
              <Select value={selectedDistrict} onValueChange={(value) => {
                setSelectedDistrict(value);
                setSelectedMarket('all'); // Reset market when district changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {filterOptions.districts.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">APMC Market</label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger>
                  <SelectValue placeholder="All Markets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  {(selectedDistrict === 'all' ? filterOptions.markets : availableMarkets).map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Commodity</label>
              <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Commodities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Commodities</SelectItem>
                  {filterOptions.commodities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Best Market Recommendation */}
          {bestMarket && !error && (
            <div className="lg:col-span-3">
              <div className="agro-card bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="text-accent fill-accent" size={28} />
                  <div>
                    <h2 className="text-xl font-bold">Best Price Today</h2>
                    <p className="text-muted-foreground">Highest modal price in current selection</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-2xl font-bold text-primary">{bestMarket.market}</p>
                    <p className="text-muted-foreground">{bestMarket.district}, Karnataka</p>
                  </div>
                  <div className="flex items-center gap-2 bg-success/10 px-4 py-2 rounded-xl">
                    <TrendingUp className="text-success" size={24} />
                    <div>
                      <p className="text-2xl font-bold text-success">₹{bestMarket.modalPrice}</p>
                      <p className="text-xs text-muted-foreground">per quintal</p>
                    </div>
                  </div>
                  <div className="bg-secondary px-4 py-2 rounded-xl">
                    <p className="font-medium">{bestMarket.commodity}</p>
                    <p className="text-xs text-muted-foreground">{bestMarket.variety}</p>
                  </div>
                </div>
                {bestMarketRecommendation && (
                  <p className="mt-4 text-sm bg-card/50 p-3 rounded-lg">{bestMarketRecommendation}</p>
                )}
              </div>
            </div>
          )}

          {/* Price List */}
          <div className="lg:col-span-2">
            <div className="agro-card">
              <h3 className="font-semibold text-lg mb-4">
                Market Prices 
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({prices.length} results)
                </span>
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : prices.length === 0 && !error ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No price data available.</p>
                  <p className="text-sm mt-2">Click "Load CSV Data" to import Karnataka APMC prices.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {prices.map((price) => (
                    <div 
                      key={price.id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        price.id === bestMarket?.id 
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
                            {price.id === bestMarket?.id && (
                              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                                Best
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {price.district} • {price.commodity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {price.variety} • {new Date(price.arrivalDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">₹{price.modalPrice}</p>
                        <p className="text-xs text-muted-foreground">per quintal</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price Alert */}
          <div className="lg:col-span-1">
            <div className="agro-card">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Bell className="text-accent" size={20} />
                Set Price Alert
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get notified when prices reach your target
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

            {/* Data Info */}
            <div className="agro-card mt-6">
              <h3 className="font-semibold text-lg mb-4">Data Source</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Source:</span> Karnataka APMC CSV</p>
                <p><span className="text-muted-foreground">State:</span> Karnataka</p>
                <p><span className="text-muted-foreground">Auto-refresh:</span> Every 6 hours</p>
                {lastUpdated && (
                  <p><span className="text-muted-foreground">Updated:</span> {new Date(lastUpdated).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Markets;
