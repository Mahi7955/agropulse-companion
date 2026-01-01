import React, { useState } from 'react';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface AIAdvisorProps {
  cropType: string;
  growthStage: string;
  weather: { temperature: number; humidity: number; rainfall: number };
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

  const quickQuestions = [
    'When should I irrigate?',
    'Best time to sell?',
    'Pest prevention tips',
    'Fertilizer schedule'
  ];

  const getAIAdvice = async (question: string) => {
    setIsLoading(true);
    
    // Simulate AI response - In production, integrate with Gemini API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const context = `
      Crop: ${cropType}
      Growth Stage: ${growthStage}
      Temperature: ${weather.temperature}°C
      Humidity: ${weather.humidity}%
      Rainfall: ${weather.rainfall}mm
      Market Price: ₹${modalPrice}/quintal
    `;
    
    // Mock AI responses based on question type
    let aiResponse = '';
    
    if (question.toLowerCase().includes('irrigat')) {
      aiResponse = `Based on current conditions for your ${cropType} in ${growthStage} stage:\n\n` +
        `• Temperature is ${weather.temperature}°C - ${weather.temperature > 35 ? 'increase watering frequency' : 'maintain normal schedule'}\n` +
        `• Humidity at ${weather.humidity}% - ${weather.humidity < 50 ? 'consider evening irrigation' : 'morning watering preferred'}\n` +
        `• ${weather.rainfall > 10 ? 'Skip irrigation for 2-3 days due to recent rainfall' : 'Water every 3-4 days'}\n\n` +
        `💧 Recommended: Deep watering in early morning (5-7 AM) for best absorption.`;
    } else if (question.toLowerCase().includes('sell') || question.toLowerCase().includes('market')) {
      aiResponse = `Market Analysis for ${cropType}:\n\n` +
        `• Current price: ₹${modalPrice}/quintal\n` +
        `• Growth stage: ${growthStage}\n\n` +
        `📊 Recommendation: ${growthStage === 'Harvesting' 
          ? 'Prices look favorable. Consider selling at APMC markets within 10km for best returns.' 
          : `Wait until harvesting stage. Monitor prices - they may ${Math.random() > 0.5 ? 'increase' : 'stabilize'} in coming weeks.`}`;
    } else if (question.toLowerCase().includes('pest') || question.toLowerCase().includes('disease')) {
      aiResponse = `Pest & Disease Prevention for ${cropType} (${growthStage} stage):\n\n` +
        `• ${weather.humidity > 70 ? '⚠️ High humidity - watch for fungal diseases' : '✅ Humidity levels normal'}\n` +
        `• Regular field inspection recommended\n` +
        `• Apply neem-based organic pesticide every 15 days\n\n` +
        `🛡️ Tip: Maintain proper spacing between plants for air circulation.`;
    } else if (question.toLowerCase().includes('fertiliz')) {
      aiResponse = `Fertilizer Schedule for ${cropType} (${growthStage}):\n\n` +
        `${growthStage === 'Seedling' ? '• Apply starter fertilizer (DAP) after 7-10 days' : ''}` +
        `${growthStage === 'Vegetative' ? '• Apply nitrogen-rich urea for leaf growth\n• Split application: 50% now, 50% after 20 days' : ''}` +
        `${growthStage === 'Flowering' ? '• Focus on phosphorus and potassium\n• Avoid excess nitrogen to prevent flower drop' : ''}` +
        `${growthStage === 'Harvesting' ? '• Stop fertilizer application\n• Focus on water management only' : ''}\n\n` +
        `🌱 Sustainable tip: Consider organic compost to improve soil health.`;
    } else {
      aiResponse = `Here's my analysis for your ${cropType} farm:\n\n` +
        `📍 Current Conditions:\n` +
        `• Growth Stage: ${growthStage}\n` +
        `• Weather: ${weather.temperature}°C, ${weather.humidity}% humidity\n` +
        `• Market Price: ₹${modalPrice}/quintal\n\n` +
        `✅ General Recommendations:\n` +
        `1. ${weather.temperature > 35 ? 'Increase irrigation due to heat' : 'Maintain regular watering'}\n` +
        `2. Monitor crop health daily\n` +
        `3. Check market prices before selling\n\n` +
        `Ask me specific questions about irrigation, fertilizers, pest control, or market timing!`;
    }
    
    setResponse(aiResponse);
    setIsLoading(false);
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
              <span>Analyzing your farm data...</span>
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
