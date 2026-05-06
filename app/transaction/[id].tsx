import TransactionForm from "@/components/TransactionForm";
import { useTransactions } from "@/context/TransactionsContext";
import { Transaction } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransaction, updateTransaction } = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransaction = async () => {
      if (!id) {
        router.back();
        return;
      }

      try {
        setLoading(true);
        const data = await getTransaction(id);
        if (data) {
          setTransaction(data);
        } else {
          Alert.alert("Erro", "Transação não encontrada");
          router.back();
        }
      } catch (err) {
        Alert.alert("Erro", "Falha ao carregar transação");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [id]);

  const handleSave = async (
    data: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => {
    if (!id) return;

    try {
      await updateTransaction(id, data);
      router.push("/financeiro");
    } catch (err) {
      console.error("Erro ao atualizar transação:", err);
      Alert.alert(
        "Erro",
        `Falha ao atualizar transação: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1e9038" />
      </View>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <TransactionForm
      transaction={transaction}
      onSave={handleSave}
      onCancel={() => router.push("/financeiro")}
    />
  );
}
