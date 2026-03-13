
import React, { useState, useRef } from 'react';
import { ShoppingItem } from '../types';

interface ItemListProps {
  items: ShoppingItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (updatedItem: ShoppingItem) => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, onRemoveItem, onUpdateItem }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editImage, setEditImage] = useState<string | undefined>(undefined);
  const [isCompressing, setIsCompressing] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(val);
  };

  const startEditing = (item: ShoppingItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditQuantity(item.quantity);
    setEditImage(item.image);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCompressing(false);
  };

  const saveEditing = (item: ShoppingItem) => {
    const price = parseFloat(editPrice);
    if (!editName || isNaN(price) || isCompressing) return;

    onUpdateItem({
      ...item,
      name: editName,
      price: price,
      quantity: editQuantity,
      image: editImage
    });
    setEditingId(null);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setEditImage(compressedBase64);
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
        <div className="text-slate-300 text-5xl mb-4">
          <i className="fas fa-basket-shopping"></i>
        </div>
        <h3 className="text-lg font-medium text-slate-600">購物車目前是空的</h3>
        <p className="text-sm text-slate-400 mt-1">開始新增商品來追蹤您的花費吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-lg font-bold text-slate-800">購物清單 ({items.length})</h2>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <div key={item.id} className={`bg-white p-4 rounded-2xl shadow-sm border transition-all ${editingId === item.id ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-100 hover:border-blue-200'}`}>
            {editingId === item.id ? (
              // 編輯模式
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="relative group/editimg">
                    {editImage ? (
                      <img src={editImage} alt={editName} className={`w-16 h-16 rounded-xl object-cover shadow-sm ${isCompressing ? 'opacity-30' : 'opacity-70'}`} />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                        <i className="fas fa-image"></i>
                      </div>
                    )}
                    <button 
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 text-white rounded-xl opacity-0 group-hover/editimg:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-camera text-xs"></i>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={editFileInputRef}
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="商品名稱"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="單價"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="數量"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => saveEditing(item)}
                    disabled={isCompressing}
                    className={`px-4 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isCompressing ? '處理中' : '儲存'}
                  </button>
                </div>
              </div>
            ) : (
              // 顯示模式
              <div className="flex items-center gap-4 group">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <i className="fas fa-tag"></i>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                    <span>單價: {formatCurrency(item.price)}</span>
                    <span>•</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-lg font-medium">x{item.quantity}</span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="font-bold text-slate-900 text-lg">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => startEditing(item)}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors p-1"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors p-1"
                    >
                      移除
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;
