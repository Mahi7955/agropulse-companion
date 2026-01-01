import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Cloud, 
  Sprout, 
  TrendingUp, 
  Bot,
  Droplets,
  Sun,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const Index: React.FC = () => {
  const features = [
    {
      icon: Cloud,
      title: 'Weather Intelligence',
      description: 'Real-time weather data with smart alerts for heatwaves, rain, and frost'
    },
    {
      icon: Sprout,
      title: 'Crop Growth Tracking',
      description: 'Monitor growth stages from seedling to harvest with visual progress'
    },
    {
      icon: Droplets,
      title: 'Smart Irrigation',
      description: 'AI-powered irrigation advice based on weather and crop needs'
    },
    {
      icon: TrendingUp,
      title: 'Market Prices',
      description: 'Live mandi prices with best market recommendations nearby'
    },
    {
      icon: Bot,
      title: 'AI Farm Advisor',
      description: 'Get instant farming advice powered by artificial intelligence'
    },
    {
      icon: Shield,
      title: 'Crop Health Monitor',
      description: 'Real-time health indicators to prevent crop losses'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sprout size={18} />
              <span className="text-sm font-medium">Smart Agriculture Platform</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            Grow Smarter with
            <span className="agro-gradient-text block mt-2">AgroPulse</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            AI-powered farming platform that helps you make better decisions with weather intelligence, 
            market prices, and personalized crop advice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup">
              <Button size="xl" variant="hero">
                Start Free Today
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="xl" variant="outline">
                I have an account
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">Active Farmers</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Markets Tracked</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">30%</p>
              <p className="text-sm text-muted-foreground">Yield Increase</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Farm Smart
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From weather forecasts to market prices, get all the tools you need in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="agro-card group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="text-primary" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="agro-card bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20 text-center py-12">
            <Sun className="mx-auto text-accent mb-4" size={48} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of farmers who are already using AgroPulse to increase yields 
              and reduce costs.
            </p>
            <Link to="/signup">
              <Button size="xl" variant="hero">
                Get Started for Free
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 AgroPulse. Built for Indian Farmers 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
