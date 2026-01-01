import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Loader2, 
  ArrowRight, 
  Navigation, 
  Sprout,
  Calendar,
  Cloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { cropTypes, indianStates, stateDistricts } from '@/lib/mockData';
import { FarmDetails } from '@/lib/types';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Location data
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  
  // Farm data
  const [cropType, setCropType] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [season, setSeason] = useState<'Kharif' | 'Rabi' | 'Zaid' | ''>('');
  const [farmSize, setFarmSize] = useState('');
  
  const { user, updateProfile, updateFarmDetails } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLocating(false);
        toast({
          title: 'Location detected!',
          description: `Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        });
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please select manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location unavailable. Please select manually.');
            break;
          default:
            setLocationError('Unable to get location. Please select manually.');
        }
      }
    );
  };

  const handleStep1Submit = () => {
    if (!latitude && (!state || !district)) {
      toast({
        title: 'Location required',
        description: 'Please detect your location or select state and district',
        variant: 'destructive',
      });
      return;
    }
    
    updateProfile({
      latitude: latitude || 0,
      longitude: longitude || 0,
      state,
      district,
      phone
    });
    
    setStep(2);
  };

  const handleStep2Submit = () => {
    if (!cropType || !sowingDate || !season) {
      toast({
        title: 'All fields required',
        description: 'Please fill in all crop details',
        variant: 'destructive',
      });
      return;
    }

    const farmDetails: FarmDetails = {
      id: `farm_${Date.now()}`,
      farmerId: user?.id || '',
      cropType,
      sowingDate: new Date(sowingDate),
      season: season as 'Kharif' | 'Rabi' | 'Zaid',
      farmSize: parseFloat(farmSize) || 1,
      farmSizeUnit: 'acres'
    };

    updateFarmDetails(farmDetails);
    
    toast({
      title: 'Registration complete!',
      description: 'Welcome to AgroPulse. Your smart farming journey begins now.',
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-muted-foreground">Complete your farm registration</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>1</div>
            <span className="hidden sm:inline">Location</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>2</div>
            <span className="hidden sm:inline">Crop Details</span>
          </div>
        </div>

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="agro-card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MapPin className="text-primary" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Farm Location</h2>
                <p className="text-sm text-muted-foreground">Help us provide accurate weather & market data</p>
              </div>
            </div>

            {/* Detect Location Button */}
            <Button
              onClick={detectLocation}
              variant="hero"
              size="lg"
              className="w-full mb-4"
              disabled={isLocating}
            >
              {isLocating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Navigation size={20} />
              )}
              {isLocating ? 'Detecting...' : 'Detect My Location'}
            </Button>

            {latitude && longitude && (
              <div className="bg-success/10 border border-success/30 rounded-xl p-3 mb-4 text-center">
                <p className="text-success font-medium">✓ Location Detected</p>
                <p className="text-sm text-muted-foreground">
                  {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
                </p>
              </div>
            )}

            {locationError && (
              <p className="text-sm text-danger mb-4 text-center">{locationError}</p>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">or select manually</span>
              </div>
            </div>

            {/* Manual Selection */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {state && (
                <div>
                  <label className="text-sm font-medium mb-2 block">District</label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {stateDistricts[state]?.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <Button
              onClick={handleStep1Submit}
              size="lg"
              className="w-full mt-6"
            >
              Continue
              <ArrowRight size={20} />
            </Button>
          </div>
        )}

        {/* Step 2: Crop Details */}
        {step === 2 && (
          <div className="agro-card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Sprout className="text-primary" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Crop Details</h2>
                <p className="text-sm text-muted-foreground">Tell us about your current crop</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Crop Type</label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar size={16} />
                  Sowing Date
                </label>
                <Input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Cloud size={16} />
                  Season
                </label>
                <Select value={season} onValueChange={(v) => setSeason(v as typeof season)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kharif">Kharif (Monsoon: Jun-Oct)</SelectItem>
                    <SelectItem value="Rabi">Rabi (Winter: Oct-Mar)</SelectItem>
                    <SelectItem value="Zaid">Zaid (Summer: Mar-Jun)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Farm Size (acres)</label>
                <Input
                  type="number"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  placeholder="e.g., 5"
                  min={0}
                  step={0.5}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleStep2Submit}
                size="lg"
                className="flex-1"
              >
                Complete Registration
                <ArrowRight size={20} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
