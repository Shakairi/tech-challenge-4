import { Transaction, TransactionSummary } from "@/types";
import { useMemo } from "react";

export function useSummary(transactions: Transaction[]): TransactionSummary | null {
  return useMemo(() => {
    if (!transactions.length) return null;

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown: { [key: string]: number } = {};
    transactions.forEach((t) => {
      if (!categoryBreakdown[t.category]) categoryBreakdown[t.category] = 0;
      categoryBreakdown[t.category] += t.type === "income" ? t.amount : -t.amount;
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      categoryBreakdown,
    };
  }, [transactions]);
}
