/**
 * TransactionCard.tsx — memoizado
 *
 * React.memo evita que o card re-renderize quando o pai atualiza
 * mas os dados desse item específico não mudaram.
 *
 * Sem memo: uma lista de 50 itens re-renderiza 50 cards ao adicionar 1.
 * Com memo: só o card novo é renderizado.
 */
import { Transaction } from "@/types";
import { formatters } from "@/utils/formatters";
import React, { memo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TransactionCardProps {
  transaction: Transaction;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// ✅ memo: só re-renderiza se as props mudarem
const TransactionCard = memo(function TransactionCard({
  transaction,
  onPress,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? "#28a745" : "#d32f2f";
  const amountPrefix = isIncome ? "+" : "-";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={[styles.typeIndicator, { backgroundColor: isIncome ? "#d4edda" : "#f8d7da" }]}>
          <Text style={[styles.typeIcon, { color: amountColor }]}>
            {isIncome ? "↑" : "↓"}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.category} numberOfLines={1}>
            {transaction.category}
          </Text>
          {transaction.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
          ) : null}
          <Text style={styles.date}>
            {new Date(transaction.date).toLocaleDateString("pt-BR")}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix} {formatters.formatCurrency(transaction.amount)}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Text style={styles.actionEdit}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Text style={styles.actionDelete}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default TransactionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  typeIcon: { fontSize: 18, fontWeight: "bold" },
  info: { flex: 1 },
  category: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 2 },
  description: { fontSize: 12, color: "#888", marginBottom: 2 },
  date: { fontSize: 11, color: "#bbb" },
  rightSection: { alignItems: "flex-end" },
  amount: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  actions: { flexDirection: "row", gap: 4 },
  actionButton: { padding: 4 },
  actionEdit: { fontSize: 14 },
  actionDelete: { fontSize: 14 },
});
