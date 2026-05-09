/**
 * usePaginatedTransactions.ts
 *
 * Hook dedicado para paginação eficiente de transações.
 * Evita recarregar tudo do zero a cada mudança de filtro.
 * Usa useCallback para estabilizar funções e evitar re-renders desnecessários.
 */
import { transactionUseCases } from "@/usecases/transactionUseCases";
import { Transaction, TransactionFilter } from "@/types";
import { useCallback, useRef, useState } from "react";

const PAGE_SIZE = 20;

export function usePaginatedTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // useRef para lastDoc evita que ele entre em deps de useCallback
  const lastDocRef = useRef<any>(null);

  const fetch = useCallback(
    async (filter: TransactionFilter, reset = false) => {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null);

        const lastDoc = reset ? null : lastDocRef.current;
        const result = await transactionUseCases.list(
          userId,
          filter,
          PAGE_SIZE,
          lastDoc,
        );

        setTransactions((prev) =>
          reset ? result.transactions : [...prev, ...result.transactions],
        );
        lastDocRef.current = result.nextDoc;
        setHasMore(result.hasMore);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const refresh = useCallback(
    (filter: TransactionFilter) => {
      lastDocRef.current = null;
      return fetch(filter, true);
    },
    [fetch],
  );

  const loadMore = useCallback(
    (filter: TransactionFilter) => {
      if (!hasMore || loading) return Promise.resolve();
      return fetch(filter, false);
    },
    [fetch, hasMore, loading],
  );

  const addOptimistic = useCallback((transaction: Transaction) => {
    // ✅ Atualização otimista — adiciona na UI antes de confirmar no servidor
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  const removeOptimistic = useCallback((id: string) => {
    // ✅ Remove da UI imediatamente, sem esperar o servidor
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateOptimistic = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t,
        ),
      );
    },
    [],
  );

  return {
    transactions,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    addOptimistic,
    removeOptimistic,
    updateOptimistic,
  };
}
