
import React from 'react';
import { ShoppingItem } from '../types';

interface DashboardProps {
  budget: number;
  items: ShoppingItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ budget, items }) => {
  const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const remaining = budget - total;
  const isOverBudget = remaining < 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { 
      style: 'currency', 
      currency: 'TWD', 
      minimumFractionDigits: 0 
    }).format(val);
  };

  const percentage = budget > 0 ? Math.min((total / budget) * 100, 100) : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">預算總額</span>
        <span className="text-2xl font-black text-slate-800">{formatCurrency(budget)}</span>
        <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
          <div className="bg-blue-500 h-full w-full"></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">目前購物車</span>
        <span className="text-2xl font-black text-slate-800">{formatCurrency(total)}</span>
        <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
          <div 
            className={`${isOverBudget ? 'bg-red-500' : 'bg-blue-500'} h-full transition-all duration-700 ease-out`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl shadow-sm border flex flex-col items-center text-center transition-all duration-300 ${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-100'}`}>
        <span className={`text-xs font-black uppercase tracking-widest mb-2 ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>剩餘預算</span>
        <span className={`text-2xl font-black ${isOverBudget ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
          {formatCurrency(remaining)}
        </span>
        {isOverBudget && (
          <div className="mt-2 px-2 py-0.5 bg-red-600 text-[10px] font-black text-white rounded-full flex items-center gap-1 uppercase tracking-tighter">
            <i className="fas fa-circle-exclamation"></i> 超出預算
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
