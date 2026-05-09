import { transactionUseCases } from "@/usecases/transactionUseCases";
import { Transaction, TransactionFilter } from "@/types";
import { useSummary } from "@/hooks/useSummary";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface ITransactionsContext {
  transactions: Transaction[];
  summary: ReturnType<typeof useSummary>;
  loading: boolean;
  error: string | null;
  filter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;
  addTransaction: (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransaction: (id: string) => Promise<Transaction | null>;
  uploadReceipt: (file: { uri: string; name: string; type: string }) => Promise<string>;
  deleteReceipt: (filePath: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  refreshTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<ITransactionsContext | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<TransactionFilter>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  // Hook separado para cálculo memoizado do summary
  const summary = useSummary(transactions);

  // ✅ Um único useEffect unificado (era 2 duplicados antes)
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshTransactions();
    }
  }, [isAuthenticated, user?.id, filter]);

  const refreshTransactions = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const result = await transactionUseCases.list(user.id, filter);
      setTransactions(result.transactions);
      setLastDoc(result.nextDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter]);

  const loadMore = useCallback(async () => {
    if (!user?.id || !hasMore || loading) return;
    try {
      setLoading(true);
      const result = await transactionUseCases.list(user.id, filter, 20, lastDoc);
      setTransactions((prev) => [...prev, ...result.transactions]);
      setLastDoc(result.nextDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter, hasMore, loading, lastDoc]);

  const addTransaction = useCallback(
    async (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      setError(null);
      const newTransaction = await transactionUseCases.add(user.id, data);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    },
    [user?.id],
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      setError(null);
      await transactionUseCases.update(id, user.id, data);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date() } : t)),
      );
    },
    [user?.id],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      setError(null);
      await transactionUseCases.remove(id, user.id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    },
    [user?.id],
  );

  const getTransaction = useCallback(async (id: string) => {
    setError(null);
    return transactionUseCases.getById(id);
  }, []);

  const uploadReceipt = useCallback(
    async (file: { uri: string; name: string; type: string }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      setError(null);
      return transactionUseCases.uploadReceipt(user.id, file);
    },
    [user?.id],
  );

  const deleteReceipt = useCallback(async (filePath: string) => {
    setError(null);
    return transactionUseCases.deleteReceipt(filePath);
  }, []);

  const setFilter = useCallback((newFilter: TransactionFilter) => {
    setFilterState(newFilter);
    setLastDoc(null);
  }, []);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        summary,
        loading,
        error,
        filter,
        setFilter,
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
    throw new Error("useTransactions deve ser usado dentro de TransactionsProvider");
  }
  return context;
}
