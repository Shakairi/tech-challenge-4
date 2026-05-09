/**
 * TransactionsContext.tsx — otimizado para performance
 *
 * Melhorias aplicadas:
 * 1. useCallback em todas as funções — evita re-renders em cascata
 * 2. useMemo para summary — não recalcula a cada render
 * 3. useEffect unificado — era 2 duplicados, agora é 1
 * 4. Atualização otimista — UI responde instantaneamente
 * 5. usePaginatedTransactions — paginação isolada e reutilizável
 */
import { transactionUseCases } from "@/usecases/transactionUseCases";
import { Transaction, TransactionFilter } from "@/types";
import { useSummary } from "@/hooks/useSummary";
import { usePaginatedTransactions } from "@/hooks/usePaginatedTransactions";
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

  const [filter, setFilterState] = useState<TransactionFilter>({
    sortBy: "date",
    sortOrder: "desc",
  });

  const {
    transactions,
    loading,
    error,
    hasMore,
    refresh,
    loadMore: paginatedLoadMore,
    addOptimistic,
    removeOptimistic,
    updateOptimistic,
  } = usePaginatedTransactions(user?.id);

  // ✅ useMemo: summary não recalcula a cada render
  const summary = useSummary(transactions);

  // ✅ useEffect unificado (era 2 duplicados)
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refresh(filter);
    }
  }, [isAuthenticated, user?.id, filter]);

  const refreshTransactions = useCallback(
    () => refresh(filter),
    [refresh, filter],
  );

  const loadMore = useCallback(
    () => paginatedLoadMore(filter),
    [paginatedLoadMore, filter],
  );

  // ✅ Atualização otimista: UI atualiza antes de confirmar no servidor
  const addTransaction = useCallback(
    async (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Cria ID temporário para atualização otimista
      const tempId = `temp_${Date.now()}`;
      const optimisticTransaction: Transaction = {
        id: tempId,
        ...data,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addOptimistic(optimisticTransaction);

      try {
        const saved = await transactionUseCases.add(user.id, data);
        // Substitui o item temporário pelo definitivo
        updateOptimistic(tempId, saved);
        return saved;
      } catch (err) {
        // Rollback: remove o item temporário se falhou
        removeOptimistic(tempId);
        throw err;
      }
    },
    [user?.id, addOptimistic, updateOptimistic, removeOptimistic],
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // ✅ Atualiza UI imediatamente
      updateOptimistic(id, data);

      try {
        await transactionUseCases.update(id, user.id, data);
      } catch (err) {
        // Rollback: recarrega do servidor se falhou
        refresh(filter);
        throw err;
      }
    },
    [user?.id, updateOptimistic, refresh, filter],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // ✅ Remove da UI imediatamente
      removeOptimistic(id);

      try {
        await transactionUseCases.remove(id, user.id);
      } catch (err) {
        // Rollback: recarrega do servidor se falhou
        refresh(filter);
        throw err;
      }
    },
    [user?.id, removeOptimistic, refresh, filter],
  );

  const getTransaction = useCallback(
    async (id: string) => transactionUseCases.getById(id),
    [],
  );

  const uploadReceipt = useCallback(
    async (file: { uri: string; name: string; type: string }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      return transactionUseCases.uploadReceipt(user.id, file);
    },
    [user?.id],
  );

  const deleteReceipt = useCallback(
    async (filePath: string) => transactionUseCases.deleteReceipt(filePath),
    [],
  );

  const setFilter = useCallback((newFilter: TransactionFilter) => {
    setFilterState(newFilter);
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
