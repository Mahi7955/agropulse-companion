import React, { useState, useEffect } from 'react';
import { Leaf, Info, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardNav from '@/components/DashboardNav';
import DiseaseDetector from '@/components/DiseaseDetector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DiseaseDetection: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cropType, setCropType] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserCrop = async () => {
      if (!user?.id) return;
      
      try {
        const { data: farmer } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (farmer) {
          const { data: farm } = await supabase
            .from('farms')
            .select('crop_type')
            .eq('farmer_id', farmer.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (farm) {
            setCropType(farm.crop_type);
          }
        }
      } catch (error) {
        console.log('Error fetching crop type:', error);
      }
    };

    fetchUserCrop();
  }, [user]);

  const commonDiseases = [
    { crop: 'Rice', diseases: ['Blast', 'Brown Spot', 'Sheath Blight', 'Bacterial Leaf Blight'] },
    { crop: 'Wheat', diseases: ['Rust', 'Powdery Mildew', 'Loose Smut', 'Karnal Bunt'] },
    { crop: 'Cotton', diseases: ['Bacterial Blight', 'Grey Mildew', 'Root Rot', 'Alternaria Leaf Spot'] },
    { crop: 'Tomato', diseases: ['Early Blight', 'Late Blight', 'Fusarium Wilt', 'Mosaic Virus'] },
    { crop: 'Potato', diseases: ['Late Blight', 'Early Blight', 'Black Leg', 'Common Scab'] },
  ];

  const tips = [
    "Take photos in good natural lighting for best results",
    "Focus on the affected part of the plant",
    "Include both healthy and affected areas if possible",
    "Take multiple photos from different angles",
    "Ensure the image is clear and not blurry"
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      <main className="lg:ml-72 pt-20 lg:pt-8 px-4 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Leaf className="text-primary" />
              Crop Disease Detection
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload a photo of your crop to detect diseases using AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Disease Detector */}
            <div className="lg:col-span-2">
              <DiseaseDetector cropType={cropType} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-warning" />
                    Photo Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Common Diseases */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Common Diseases
                  </CardTitle>
                  <CardDescription>
                    Watch out for these diseases in your crops
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {commonDiseases.map((item, idx) => (
                      <div key={idx}>
                        <p className="font-medium text-sm">{item.crop}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.diseases.map((disease, dIdx) => (
                            <span 
                              key={dIdx}
                              className="text-xs bg-muted px-2 py-1 rounded-full"
                            >
                              {disease}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Card className="bg-warning/5 border-warning/30">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">
                    <strong>Disclaimer:</strong> This AI-based detection is for guidance only. 
                    For severe infections, please consult your local agricultural officer or 
                    Krishi Vigyan Kendra (KVK) for expert advice.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiseaseDetection;
