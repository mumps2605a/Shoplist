
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Dashboard from './components/Dashboard.tsx';
import ItemForm from './components/ItemForm.tsx';
import ItemList from './components/ItemList.tsx';
import BudgetManager from './components/BudgetManager.tsx';
import { ShoppingItem } from './types.ts';

const App: React.FC = () => {
  const [budget, setBudget] = useState<number>(() => {
    const saved = localStorage.getItem('shopping-budget');
    return saved ? parseFloat(saved) : 2000;
  });

  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shopping-items');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("解析快取商品失敗", e);
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 當預算改變時存入 localStorage
  useEffect(() => {
    localStorage.setItem('shopping-budget', budget.toString());
  }, [budget]);

  // 當商品清單改變時存入 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shopping-items', JSON.stringify(items));
    } catch (e) {
      console.error("儲存商品至 localStorage 失敗", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert('儲存空間已滿（可能是圖片過多），請刪除部分含有圖片的舊商品。');
      }
    }
  }, [items]);

  // 計算總金額
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  }, [items]);

  const remainingBudget = budget - totalAmount;

  const handleAddItem = (newItemData: Omit<ShoppingItem, 'id' | 'timestamp'>) => {
    const newItem: ShoppingItem = {
      ...newItemData,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      timestamp: Date.now()
    };
    setItems(prev => [newItem, ...prev]);
  };

  const handleUpdateItem = (updatedItem: ShoppingItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('確定要清空目前所有商品嗎？此動作無法復原。')) {
      setItems([]);
    }
  };

  const triggerJsonImport = () => {
    fileInputRef.current?.click();
  };

  // 強化版 JSON 匯入邏輯
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        console.log("正在解析匯入的 JSON:", data);

        // 彈性檢測商品陣列 (優先抓取 data.items)
        let rawItems = null;
        if (data.items && Array.isArray(data.items)) {
          rawItems = data.items;
        } else if (Array.isArray(data)) {
          rawItems = data;
        }

        if (rawItems && Array.isArray(rawItems)) {
          if (window.confirm(`讀取成功！找到 ${rawItems.length} 筆商品，是否確定匯入並覆蓋目前清單？`)) {
            
            // 同步更新預算
            if (data.budget !== undefined && !isNaN(Number(data.budget))) {
              setBudget(Number(data.budget));
            }
            
            // 驗證並清洗商品資料
            const validatedItems: ShoppingItem[] = rawItems.map((item: any) => ({
              id: item.id || Math.random().toString(36).substring(2, 15),
              name: String(item.name || '未命名商品'),
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 1,
              image: item.image || undefined,
              timestamp: Number(item.timestamp) || Date.now()
            }));

            // 強制更新狀態
            setItems([]); // 先清空確保觸發更新
            setTimeout(() => {
              setItems(validatedItems);
              alert('資料已成功載入！');
            }, 0);
          }
        } else {
          alert('匯入失敗：檔案格式不正確，找不到商品列表。');
        }
      } catch (err) {
        console.error("JSON 解析錯誤:", err);
        alert('檔案解析失敗，這可能不是一個有效的 JSON 檔案。');
      }
      
      // 重置 input 以利下次選取同一檔案
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // 備份到 JSON
  const exportToJson = () => {
    const data = {
      budget,
      items,
      exportAt: new Date().toISOString(),
      version: "1.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toLocaleDateString('zh-TW').replace(/\//g, '-');
    link.href = url;
    link.download = `購物助手備份_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 匯出到 Word (Doc)
  const exportToDoc = () => {
    if (items.length === 0) {
      alert('購物車是空的，無法匯出。');
      return;
    }
    const dateStr = new Date().toLocaleDateString('zh-TW');
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                    <head><meta charset='utf-8'><title>購物清單</title>
                    <style>
                      table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
                      th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                      th { background-color: #f3f4f6; }
                      .warning { color: red; font-weight: bold; }
                      .summary { margin-top: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
                    </style></head><body>`;
    const footer = "</body></html>";
    
    let rows = items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toLocaleString()}</td>
        <td>$${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const content = `
      <h1>購物清單 (${dateStr})</h1>
      <p>設定預算: $${budget.toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            <th>項目名稱</th>
            <th>數量</th>
            <th>單價</th>
            <th>小計</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="summary">
        <p>總金額: $${totalAmount.toLocaleString()}</p>
        <p class="${remainingBudget < 0 ? 'warning' : ''}">
          剩餘預算: $${remainingBudget.toLocaleString()} ${remainingBudget < 0 ? '(已超出！)' : ''}
        </p>
      </div>
    `;

    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `購物清單_${dateStr.replace(/\//g, '-')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 pb-24">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center">
              <i className="fas fa-cart-shopping text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">購物預算助手</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Shopping Helper</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={triggerJsonImport}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <i className="fas fa-file-import"></i> 匯入 JSON
            </button>
            <button 
              onClick={exportToJson}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <i className="fas fa-file-export"></i> 備份資料
            </button>
            <button 
              onClick={exportToDoc}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-200 shadow-sm transition-all active:scale-95"
            >
              <i className="fas fa-file-word"></i> 匯出 Word
            </button>
            <input 
              type="file" 
              accept="application/json,.json" 
              ref={fileInputRef} 
              onChange={handleJsonImport} 
              className="hidden" 
            />
            <button 
              onClick={handleClearAll}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 text-sm font-bold"
              title="重置所有商品"
            >
              <i className="fas fa-trash-can"></i>
            </button>
          </div>
        </div>
      </header>

      <BudgetManager initialBudget={budget} onUpdateBudget={setBudget} />

      <Dashboard budget={budget} items={items} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-6">
            <ItemForm onAddItem={handleAddItem} />
          </div>
        </div>
        
        <div className="lg:col-span-7">
          <ItemList items={items} onRemoveItem={handleRemoveItem} onUpdateItem={handleUpdateItem} />
        </div>
      </div>

      {/* 手機版底部統計欄 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 lg:hidden z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">剩餘預算</span>
             <span className={`font-black text-2xl leading-none ${remainingBudget < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
               ${remainingBudget.toLocaleString()}
             </span>
           </div>
           <div className="flex flex-col text-right">
             <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">目前總額</span>
             <span className="font-black text-2xl leading-none text-slate-900">
               ${totalAmount.toLocaleString()}
             </span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
