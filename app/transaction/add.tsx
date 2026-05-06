import TransactionForm from "@/components/TransactionForm";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionsContext";
import { Transaction } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { user, isAuthenticated } = useAuth();

  const handleSave = async (
    data: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => {
    if (!isAuthenticated || !user?.id) {
      Alert.alert(
        "Erro",
        "Você precisa estar autenticado para salvar transações",
      );
      return;
    }

    try {
      await addTransaction(data);
      router.push("/financeiro");
    } catch (err) {
      console.error("Erro ao adicionar transação:", err);
      Alert.alert(
        "Erro",
        `Falha ao salvar transação: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
    }
  };

  return (
    <TransactionForm
      onSave={handleSave}
      onCancel={() => router.push("/financeiro")}
    />
  );
}
