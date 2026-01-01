import React, { useState, useMemo } from 'react';
import { Calculator, Coins, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Expense, ProfitEstimate } from '@/lib/types';

interface ExpenseCalculatorProps {
  modalPrice: number;
  cropType: string;
}

const ExpenseCalculator: React.FC<ExpenseCalculatorProps> = ({ modalPrice, cropType }) => {
  const [expenses, setExpenses] = useState<Omit<Expense, 'id' | 'farmerId' | 'date'>[]>([
    { category: 'seed', amount: 0, description: 'Seeds' },
    { category: 'fertilizer', amount: 0, description: 'Fertilizers' },
    { category: 'labor', amount: 0, description: 'Labor' },
    { category: 'pesticide', amount: 0, description: 'Pesticides' },
    { category: 'equipment', amount: 0, description: 'Equipment' },
  ]);
  const [expectedYield, setExpectedYield] = useState(20); // quintals

  const updateExpense = (index: number, amount: number) => {
    const updated = [...expenses];
    updated[index].amount = amount;
    setExpenses(updated);
  };

  const estimate: ProfitEstimate = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expectedRevenue = expectedYield * modalPrice;
    const profitOrLoss = expectedRevenue - totalExpenses;
    
    return {
      totalExpenses,
      expectedYield,
      expectedRevenue,
      profitOrLoss,
      isProfitable: profitOrLoss > 0
    };
  }, [expenses, expectedYield, modalPrice]);

  const categoryIcons: Record<string, string> = {
    seed: '🌱',
    fertilizer: '🧪',
    labor: '👷',
    pesticide: '🛡️',
    equipment: '🚜',
    other: '📦'
  };

  return (
    <div className="agro-card">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Calculator className="text-primary" size={24} />
        Expense & Profit Calculator
      </h3>

      {/* Expected Yield Input */}
      <div className="bg-secondary/50 rounded-xl p-4 mb-4">
        <label className="text-sm font-medium mb-2 block">Expected Yield (quintals)</label>
        <Input
          type="number"
          value={expectedYield}
          onChange={(e) => setExpectedYield(Number(e.target.value))}
          min={0}
          className="text-lg font-semibold"
        />
        <p className="text-xs text-muted-foreground mt-1">
          At current price ₹{modalPrice}/quintal for {cropType}
        </p>
      </div>

      {/* Expense Inputs */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-muted-foreground">Expenses</h4>
        {expenses.map((expense, index) => (
          <div key={expense.category} className="flex items-center gap-3">
            <span className="text-2xl">{categoryIcons[expense.category]}</span>
            <div className="flex-1">
              <label className="text-sm">{expense.description}</label>
              <Input
                type="number"
                value={expense.amount || ''}
                onChange={(e) => updateExpense(index, Number(e.target.value))}
                placeholder="₹0"
                min={0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Expenses</span>
          <span className="font-semibold text-danger">₹{estimate.totalExpenses.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Expected Revenue</span>
          <span className="font-semibold text-success">₹{estimate.expectedRevenue.toLocaleString()}</span>
        </div>
        <div className={`flex justify-between items-center p-4 rounded-xl ${
          estimate.isProfitable 
            ? 'bg-success/10 border-2 border-success/30' 
            : 'bg-danger/10 border-2 border-danger/30'
        }`}>
          <span className="font-semibold flex items-center gap-2">
            {estimate.isProfitable ? (
              <TrendingUp className="text-success" size={20} />
            ) : (
              <TrendingDown className="text-danger" size={20} />
            )}
            {estimate.isProfitable ? 'Expected Profit' : 'Expected Loss'}
          </span>
          <span className={`text-xl font-bold ${
            estimate.isProfitable ? 'text-success' : 'text-danger'
          }`}>
            ₹{Math.abs(estimate.profitOrLoss).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCalculator;
