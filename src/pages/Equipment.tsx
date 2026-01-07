import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Filter, Search, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import DashboardNav from '@/components/DashboardNav';
import EquipmentCard from '@/components/EquipmentCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Equipment {
  id: string;
  equipment_type: string;
  equipment_name: string;
  description: string | null;
  daily_price: number;
  is_available: boolean;
  district: string | null;
  state: string | null;
  phone_contact: string | null;
  latitude: number | null;
  longitude: number | null;
  farmers: {
    name: string;
    phone: string | null;
    district: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

const EQUIPMENT_TYPES = [
  'Tractor',
  'Harvester',
  'Plough',
  'Sprayer',
  'Seeder',
  'Thresher',
  'Rotavator',
  'Cultivator',
  'Other'
];

const Equipment: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  
  // Add equipment dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    equipment_type: '',
    equipment_name: '',
    description: '',
    daily_price: '',
    phone_contact: ''
  });

  const { user } = useAuth();

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('equipment', {
        body: null,
        method: 'GET'
      });

      // Alternative: Direct query if function fails
      const { data: directData, error: directError } = await supabase
        .from('equipment')
        .select(`
          *,
          farmers:owner_id (
            name,
            phone,
            district,
            state,
            latitude,
            longitude
          )
        `)
        .order('created_at', { ascending: false });

      if (directError) {
        console.error('Direct query error:', directError);
        throw directError;
      }

      setEquipment(directData || []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Failed to load equipment listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleAddEquipment = async () => {
    if (!newEquipment.equipment_type || !newEquipment.equipment_name || !newEquipment.daily_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get farmer ID for current user
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .select('id, district, state, latitude, longitude')
        .eq('user_id', user?.id)
        .single();

      if (farmerError || !farmer) {
        toast.error('Please complete your farmer profile first');
        return;
      }

      const { error: insertError } = await supabase
        .from('equipment')
        .insert({
          owner_id: farmer.id,
          equipment_type: newEquipment.equipment_type,
          equipment_name: newEquipment.equipment_name,
          description: newEquipment.description || null,
          daily_price: parseFloat(newEquipment.daily_price),
          phone_contact: newEquipment.phone_contact || null,
          district: farmer.district,
          state: farmer.state,
          latitude: farmer.latitude,
          longitude: farmer.longitude,
          is_available: true
        });

      if (insertError) throw insertError;

      toast.success('Equipment listed successfully!');
      setIsAddDialogOpen(false);
      setNewEquipment({
        equipment_type: '',
        equipment_name: '',
        description: '',
        daily_price: '',
        phone_contact: ''
      });
      fetchEquipment();
    } catch (err) {
      console.error('Error adding equipment:', err);
      toast.error('Failed to list equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter equipment
  const filteredEquipment = equipment.filter(item => {
    if (showAvailableOnly && !item.is_available) return false;
    if (typeFilter !== 'all' && item.equipment_type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (districtFilter !== 'all' && item.district !== districtFilter) return false;
    if (maxPrice && item.daily_price > parseFloat(maxPrice)) return false;
    return true;
  });

  // Get unique districts
  const districts = [...new Set(equipment.map(e => e.district).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      <main className="lg:ml-72 pt-20 lg:pt-8 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Wrench className="text-primary" />
                Equipment Marketplace
              </h1>
              <p className="text-muted-foreground mt-1">
                Rent farm equipment from nearby farmers
              </p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  List Your Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>List Your Equipment</DialogTitle>
                  <DialogDescription>
                    Share your farm equipment with nearby farmers and earn extra income
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Equipment Type *</Label>
                    <Select 
                      value={newEquipment.equipment_type}
                      onValueChange={(value) => setNewEquipment({ ...newEquipment, equipment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Equipment Name *</Label>
                    <Input 
                      placeholder="e.g., Mahindra 575 DI Tractor"
                      value={newEquipment.equipment_name}
                      onChange={(e) => setNewEquipment({ ...newEquipment, equipment_name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Daily Rental Price (₹) *</Label>
                    <Input 
                      type="number"
                      placeholder="e.g., 2500"
                      value={newEquipment.daily_price}
                      onChange={(e) => setNewEquipment({ ...newEquipment, daily_price: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input 
                      placeholder="Your contact number"
                      value={newEquipment.phone_contact}
                      onChange={(e) => setNewEquipment({ ...newEquipment, phone_contact: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Describe your equipment condition, features, etc."
                      value={newEquipment.description}
                      onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleAddEquipment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Listing...
                      </>
                    ) : (
                      'List Equipment'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{equipment.length}</p>
                <p className="text-sm text-muted-foreground">Total Listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-success">
                  {equipment.filter(e => e.is_available).length}
                </p>
                <p className="text-sm text-muted-foreground">Available Now</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-warning">{districts.length}</p>
                <p className="text-sm text-muted-foreground">Districts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-secondary-foreground">
                  {[...new Set(equipment.map(e => e.equipment_type))].length}
                </p>
                <p className="text-sm text-muted-foreground">Equipment Types</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Equipment Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {EQUIPMENT_TYPES.map(type => (
                        <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={districtFilter} onValueChange={setDistrictFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map(district => (
                        <SelectItem key={district} value={district!}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Max Daily Price (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="No limit"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch 
                      checked={showAvailableOnly}
                      onCheckedChange={setShowAvailableOnly}
                    />
                    <span className="text-sm">Available only</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="border-danger/30">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
                <p className="text-danger font-medium">{error}</p>
                <Button onClick={fetchEquipment} className="mt-4" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredEquipment.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg">No Equipment Found</h3>
                <p className="text-muted-foreground mt-1">
                  {equipment.length === 0 
                    ? 'Be the first to list your equipment!'
                    : 'Try adjusting your filters'}
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  List Your Equipment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map((item) => (
                <EquipmentCard 
                  key={item.id} 
                  equipment={item}
                  userLocation={userLocation}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Equipment;
