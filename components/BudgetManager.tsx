
import React, { useState } from 'react';

interface BudgetManagerProps {
  initialBudget: number;
  onUpdateBudget: (newBudget: number) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ initialBudget, onUpdateBudget }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialBudget.toString());

  const handleSave = () => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(val);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      {isEditing ? (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-32 px-4 py-2 bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-check"></i>
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold transition-all border border-blue-100 group"
        >
          <i className="fas fa-wallet group-hover:scale-110 transition-transform"></i>
          <span>設定預算: ${initialBudget}</span>
          <i className="fas fa-pen text-xs opacity-50"></i>
        </button>
      )}
      
      <div className="flex-1"></div>

      <div className="text-xs text-slate-400 flex items-center gap-1">
        <i className="fas fa-clock"></i>
        最後更新: {new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default BudgetManager;
