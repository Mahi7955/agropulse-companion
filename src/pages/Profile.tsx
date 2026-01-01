import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Sprout, 
  Calendar,
  Save,
  Edit2
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
import { cropTypes, indianStates, stateDistricts } from '@/lib/mockData';

const Profile: React.FC = () => {
  const { user, farmDetails, updateProfile, updateFarmDetails } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState(user?.state || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [cropType, setCropType] = useState(farmDetails?.cropType || '');
  const [season, setSeason] = useState(farmDetails?.season || '');
  const [farmSize, setFarmSize] = useState(farmDetails?.farmSize?.toString() || '');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSave = () => {
    updateProfile({
      name,
      phone,
      state,
      district
    });

    if (farmDetails) {
      updateFarmDetails({
        ...farmDetails,
        cropType,
        season: season as 'Kharif' | 'Rabi' | 'Zaid',
        farmSize: parseFloat(farmSize) || 1
      });
    }

    setIsEditing(false);
    toast({
      title: 'Profile updated',
      description: 'Your changes have been saved successfully',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      <main className="lg:ml-72 pt-20 lg:pt-6 pb-8 px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <User className="text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground">Manage your account and farm details</p>
          </div>
          <Button
            variant={isEditing ? 'default' : 'outline'}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <Save size={18} />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 size={18} />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          {/* Personal Information */}
          <div className="agro-card">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="text-primary" size={20} />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                {isEditing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <p className="text-lg">{user?.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </label>
                <p className="text-lg text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Phone size={16} />
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                ) : (
                  <p className="text-lg">{user?.phone || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="agro-card">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="text-primary" size={20} />
              Farm Location
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                {isEditing ? (
                  <Select value={state} onValueChange={(v) => { setState(v); setDistrict(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg">{user?.state || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">District</label>
                {isEditing ? (
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {stateDistricts[state]?.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg">{user?.district || 'Not set'}</p>
                )}
              </div>
              {user?.latitude && user?.longitude && (
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-sm text-muted-foreground">GPS Coordinates</p>
                  <p className="font-mono text-sm">
                    {user.latitude.toFixed(4)}°N, {user.longitude.toFixed(4)}°E
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Farm Details */}
          <div className="agro-card lg:col-span-2">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Sprout className="text-primary" size={20} />
              Farm Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Crop</label>
                {isEditing ? (
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg">{farmDetails?.cropType}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Season</label>
                {isEditing ? (
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kharif">Kharif</SelectItem>
                      <SelectItem value="Rabi">Rabi</SelectItem>
                      <SelectItem value="Zaid">Zaid</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg">{farmDetails?.season}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Farm Size (acres)</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    min={0}
                    step={0.5}
                  />
                ) : (
                  <p className="text-lg">{farmDetails?.farmSize} acres</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar size={16} />
                  Sowing Date
                </label>
                <p className="text-lg">
                  {farmDetails?.sowingDate?.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
