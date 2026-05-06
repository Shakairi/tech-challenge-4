export interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  phone?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string; // ID da categoria
  type: "income" | "expense";
  description: string;
  date: Date;
  receiptUrl?: string;
  receiptFileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  type?: "income" | "expense";
  searchText?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  categoryBreakdown: {
    [categoryId: string]: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
