import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, AlertTriangle, CheckCircle, XCircle, Leaf } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiseaseResult {
  diseaseDetected: boolean;
  diseaseName: string;
  severity: string;
  confidence: number;
  symptoms: string[];
  causes: string[];
  treatment: {
    immediate: string[];
    preventive: string[];
    organic: string[];
    chemical: string[];
  };
  affectedParts: string[];
  spreadRisk: string;
  recommendation: string;
}

interface DiseaseDetectorProps {
  cropType?: string;
}

const DiseaseDetector: React.FC<DiseaseDetectorProps> = ({ cropType }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64Data = selectedImage.split(',')[1];
      
      const { data, error } = await supabase.functions.invoke('crop-disease-detector', {
        body: { 
          imageBase64: base64Data,
          cropType: cropType || 'unknown'
        }
      });

      if (error) throw error;
      
      if (data?.success && data?.data) {
        setResult(data.data);
        if (data.data.diseaseDetected) {
          toast.warning(`Disease detected: ${data.data.diseaseName}`);
        } else {
          toast.success('Your crop appears healthy!');
        }
      } else {
        throw new Error(data?.error || 'Failed to analyze image');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'bg-danger text-danger-foreground';
      case 'moderate': return 'bg-warning text-warning-foreground';
      case 'mild': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="text-primary" />
          Crop Disease Detection
        </CardTitle>
        <CardDescription>
          Upload a photo of your crop to detect diseases using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Upload Section */}
        <div 
          className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedImage ? (
            <div className="space-y-4">
              <img 
                src={selectedImage} 
                alt="Selected crop" 
                className="max-h-64 mx-auto rounded-lg object-contain"
              />
              <p className="text-sm text-muted-foreground">Click to select a different image</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Upload Crop Image</p>
                <p className="text-sm text-muted-foreground">Take a photo or upload an image of the affected plant</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        {/* Analyze Button */}
        {selectedImage && (
          <Button 
            onClick={analyzeImage} 
            disabled={isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Analyze Image
              </>
            )}
          </Button>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {/* Status Header */}
            <div className={`p-4 rounded-xl ${result.diseaseDetected ? 'bg-danger/10' : 'bg-success/10'}`}>
              <div className="flex items-center gap-3">
                {result.diseaseDetected ? (
                  <XCircle className="w-8 h-8 text-danger" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-success" />
                )}
                <div>
                  <h3 className={`font-bold text-lg ${result.diseaseDetected ? 'text-danger' : 'text-success'}`}>
                    {result.diseaseName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getSeverityColor(result.severity)}>
                      {result.severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Confidence: {result.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {result.diseaseDetected && (
              <>
                {/* Symptoms */}
                {result.symptoms.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Symptoms
                    </h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {result.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Affected Parts */}
                {result.affectedParts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium">Affected Parts:</span>
                    {result.affectedParts.map((part, idx) => (
                      <Badge key={idx} variant="outline">{part}</Badge>
                    ))}
                  </div>
                )}

                {/* Spread Risk */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Spread Risk:</span>
                  <span className={`font-semibold ${getRiskColor(result.spreadRisk)}`}>
                    {result.spreadRisk}
                  </span>
                </div>

                {/* Treatment */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Treatment Options</h4>
                  
                  {result.treatment.immediate.length > 0 && (
                    <div className="bg-danger/5 p-3 rounded-lg">
                      <p className="text-sm font-medium text-danger mb-1">⚡ Immediate Action</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {result.treatment.immediate.map((action, idx) => (
                          <li key={idx}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.treatment.organic.length > 0 && (
                    <div className="bg-success/5 p-3 rounded-lg">
                      <p className="text-sm font-medium text-success mb-1">🌿 Organic Treatment</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {result.treatment.organic.map((action, idx) => (
                          <li key={idx}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.treatment.chemical.length > 0 && (
                    <div className="bg-warning/5 p-3 rounded-lg">
                      <p className="text-sm font-medium text-warning mb-1">💊 Chemical Treatment</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {result.treatment.chemical.map((action, idx) => (
                          <li key={idx}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.treatment.preventive.length > 0 && (
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <p className="text-sm font-medium text-primary mb-1">🛡️ Prevention</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {result.treatment.preventive.map((action, idx) => (
                          <li key={idx}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Recommendation */}
            <div className="bg-muted p-4 rounded-xl">
              <p className="text-sm font-medium mb-1">💡 Recommendation</p>
              <p className="text-sm text-muted-foreground">{result.recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiseaseDetector;
