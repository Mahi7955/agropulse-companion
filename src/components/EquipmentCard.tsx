import React from 'react';
import { Phone, MapPin, IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface EquipmentCardProps {
  equipment: Equipment;
  userLocation?: { lat: number; lng: number } | null;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, userLocation }) => {
  const getEquipmentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tractor': return '🚜';
      case 'harvester': return '🌾';
      case 'plough': return '⚙️';
      case 'sprayer': return '💨';
      case 'seeder': return '🌱';
      case 'thresher': return '🔄';
      case 'rotavator': return '🔧';
      default: return '🔧';
    }
  };

  const calculateDistance = () => {
    if (!userLocation) return null;
    
    const equipLat = equipment.latitude || equipment.farmers?.latitude;
    const equipLng = equipment.longitude || equipment.farmers?.longitude;
    
    if (!equipLat || !equipLng) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (equipLat - userLocation.lat) * Math.PI / 180;
    const dLon = (equipLng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(equipLat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };

  const distance = calculateDistance();
  const contactPhone = equipment.phone_contact || equipment.farmers?.phone;
  const location = equipment.district || equipment.farmers?.district;
  const state = equipment.state || equipment.farmers?.state;

  return (
    <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getEquipmentIcon(equipment.equipment_type)}</span>
            <div>
              <CardTitle className="text-lg">{equipment.equipment_name}</CardTitle>
              <CardDescription>{equipment.equipment_type}</CardDescription>
            </div>
          </div>
          <Badge 
            variant={equipment.is_available ? "default" : "secondary"}
            className={equipment.is_available ? "bg-success" : "bg-muted"}
          >
            {equipment.is_available ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Available
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Rented
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {equipment.description && (
          <p className="text-sm text-muted-foreground">{equipment.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-primary font-bold text-xl">
            <IndianRupee className="w-5 h-5" />
            <span>{equipment.daily_price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground font-normal">/day</span>
          </div>
          
          {distance !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{distance.toFixed(1)} km away</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}{state ? `, ${state}` : ''}</span>
        </div>

        {equipment.farmers && (
          <div className="pt-3 border-t flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{equipment.farmers.name}</p>
              <p className="text-xs text-muted-foreground">Equipment Owner</p>
            </div>
            {contactPhone && (
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2"
                onClick={() => window.open(`tel:${contactPhone}`, '_self')}
              >
                <Phone className="w-4 h-4" />
                Call
              </Button>
            )}
          </div>
        )}

        {!equipment.is_available && (
          <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Currently rented out</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
