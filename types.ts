
export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  timestamp: number;
}

export interface BudgetState {
  limit: number;
  items: ShoppingItem[];
}

// 即使不使用 AI，保留此定義可防止服務檔案報錯
export interface AIResult {
  name: string;
  price: number;
}
