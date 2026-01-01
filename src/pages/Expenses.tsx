import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import DashboardNav from '@/components/DashboardNav';
import ExpenseCalculator from '@/components/ExpenseCalculator';
import { useAuth } from '@/contexts/AuthContext';
import { generateMockMandiPrices } from '@/lib/mockData';

const Expenses: React.FC = () => {
  const { user, farmDetails } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalPrice, setModalPrice] = useState(2000);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (farmDetails && user?.state) {
      const prices = generateMockMandiPrices(farmDetails.cropType, user.state);
      if (prices.length > 0) {
        setModalPrice(prices[0].modalPrice);
      }
    }
  }, [farmDetails, user?.state]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      <main className="lg:ml-72 pt-20 lg:pt-6 pb-8 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Calculator className="text-primary" />
            Expense Calculator
          </h1>
          <p className="text-muted-foreground">Track expenses and estimate your profit</p>
        </div>

        <div className="max-w-2xl">
          <ExpenseCalculator 
            modalPrice={modalPrice}
            cropType={farmDetails?.cropType || 'Rice'}
          />

          {/* Tips Card */}
          <div className="agro-card mt-6 bg-gradient-to-r from-accent/10 to-primary/5">
            <h3 className="font-semibold text-lg mb-3">💡 Cost-Saving Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Buy seeds and fertilizers in bulk during off-season for better rates
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Join a Farmer Producer Organization (FPO) for collective bargaining
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Use organic compost to reduce fertilizer costs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Check government subsidy schemes for equipment and inputs
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Expenses;
