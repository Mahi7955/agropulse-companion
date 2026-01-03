import React, { useState } from 'react';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIAdvisorProps {
  cropType: string;
  growthStage: string;
  weather: { temperature: number; humidity: number; rainfall: number; description?: string };
  modalPrice: number;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ 
  cropType, 
  growthStage, 
  weather, 
  modalPrice 
}) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const quickQuestions = [
    'When should I irrigate?',
    'Best time to sell?',
    'Pest prevention tips',
    'Fertilizer schedule'
  ];

  const getAIAdvice = async (question: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          cropType,
          growthStage,
          weather: {
            ...weather,
            description: weather.description || 'Normal conditions'
          },
          mandiPrices: {
            modalPrice,
            market: 'Local APMC'
          },
          question
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResponse(data.advice);
    } catch (error) {
      console.error('AI Advisor error:', error);
      toast({
        title: 'AI Advisor Error',
        description: 'Could not get AI advice. Please try again.',
        variant: 'destructive'
      });
      
      // Fallback response
      setResponse(`Based on your ${cropType} in ${growthStage} stage with current temperature of ${weather.temperature}°C and ${weather.humidity}% humidity:\n\n• Monitor your crops regularly\n• Follow standard irrigation schedule\n• Check market prices before selling`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (query.trim()) {
      getAIAdvice(query);
      setQuery('');
    }
  };

  return (
    <div className="agro-card">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Bot className="text-primary" size={24} />
        AI Farm Advisor
        <Sparkles className="text-accent" size={16} />
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-2">Powered by Gemini</span>
      </h3>

      {/* Quick Questions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickQuestions.map((q) => (
          <Button
            key={q}
            variant="secondary"
            size="sm"
            onClick={() => {
              setQuery(q);
              getAIAdvice(q);
            }}
            disabled={isLoading}
          >
            {q}
          </Button>
        ))}
      </div>

      {/* Response Area */}
      {(response || isLoading) && (
        <div className="bg-secondary/50 rounded-xl p-4 mb-4 min-h-[120px]">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" size={20} />
              <span>Analyzing your farm data with Gemini AI...</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm font-sans">{response}</pre>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me about irrigation, fertilizers, pest control, or market prices..."
          className="min-h-[50px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading}
          size="icon-lg"
        >
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
};

export default AIAdvisor;
