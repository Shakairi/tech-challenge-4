import { storageService, transactionsService } from "@/firebase/transactions";
import { Transaction, TransactionFilter, TransactionSummary } from "@/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface ITransactionsContext {
  transactions: Transaction[];
  summary: TransactionSummary | null;
  loading: boolean;
  error: string | null;
  filter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;

  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    transaction: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransaction: (id: string) => Promise<Transaction | null>;
  uploadReceipt: (file: {
    uri: string;
    name: string;
    type: string;
  }) => Promise<string>;
  deleteReceipt: (filePath: string) => Promise<void>;

  loadMore: () => Promise<void>;
  hasMore: boolean;

  refreshTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<ITransactionsContext | undefined>(
  undefined,
);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      refreshTransactions();
    }
  }, [isAuthenticated, user?.email]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshTransactions();
    }
  }, [filter]);

  useEffect(() => {
    if (transactions.length > 0) {
      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;

      const categoryBreakdown: { [key: string]: number } = {};
      transactions.forEach((t) => {
        if (!categoryBreakdown[t.category]) {
          categoryBreakdown[t.category] = 0;
        }
        categoryBreakdown[t.category] +=
          t.type === "income" ? t.amount : -t.amount;
      });

      setSummary({
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length,
        categoryBreakdown,
      });
    } else {
      setSummary(null);
    }
  }, [transactions]);

  async function refreshTransactions() {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await transactionsService.listTransactions(
        user.id,
        filter,
      );
      setTransactions(result.transactions);
      setLastDoc(result.nextDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao carregar transações:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!user?.id || !hasMore || loading) return;

    try {
      setLoading(true);
      const result = await transactionsService.listTransactions(
        user.id,
        filter,
        20,
        lastDoc,
      );
      setTransactions((prev) => [...prev, ...result.transactions]);
      setLastDoc(result.nextDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao carregar mais transações:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addTransaction(
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ) {
    if (!user?.id) throw new Error("Usuário não autenticado");

    try {
      setError(null);
      const newTransaction = await transactionsService.addTransaction(
        user.id,
        transaction,
      );
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function updateTransaction(
    id: string,
    transaction: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>,
  ) {
    try {
      setError(null);
      await transactionsService.updateTransaction(id, transaction);
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...transaction,
                updatedAt: new Date(),
              }
            : t,
        ),
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteTransaction(id: string) {
    try {
      setError(null);
      await transactionsService.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function getTransaction(id: string) {
    try {
      setError(null);
      return await transactionsService.getTransaction(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function uploadReceipt(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<string> {
    if (!user?.id) throw new Error("Usuário não autenticado");

    try {
      setError(null);
      const { downloadUrl } = await storageService.uploadFile(user.id, file);
      return downloadUrl;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteReceipt(filePath: string) {
    try {
      setError(null);
      await storageService.deleteFile(filePath);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        summary,
        loading,
        error,
        filter,
        setFilter: (newFilter) => {
          setFilter(newFilter);
          setLastDoc(null);
        },
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransaction,
        uploadReceipt,
        deleteReceipt,
        loadMore,
        hasMore,
        refreshTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      "useTransactions deve ser usado dentro de TransactionsProvider",
    );
  }
  return context;
}
