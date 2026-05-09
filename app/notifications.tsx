import Icon from "@/components/Icon";
import { Icons, IconSizes } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionsContext";
import { formatters } from "@/utils/formatters";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationItem {
  id: string;
  type: "income" | "expense" | "system";
  title: string;
  message: string;
  amount?: number;
  category?: string;
  date: Date | string;
  read: boolean;
}

const SYSTEM_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "sys-1",
    type: "system",
    title: "Meta alcançada",
    message: "Parabéns! Você atingiu sua meta de economia para este mês",
    date: new Date(Date.now() - 86400000),
    read: true,
  },
  {
    id: "sys-2",
    type: "system",
    title: "Resumo mensal disponível",
    message: "Seu relatório financeiro de março está pronto",
    date: new Date(Date.now() - 172800000),
    read: true,
  },
];

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return d.toLocaleDateString("pt-BR");
}

export default function Notifications() {
  const router = useRouter();
  const { user } = useAuth();
  const { transactions } = useTransactions();

  // ✅ useMemo: lista não é recalculada a cada render
  const notifications = useMemo<NotificationItem[]>(() => {
    const transactionNotifs: NotificationItem[] = transactions
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
      .map((t, index) => ({
        id: t.id || `notif-${index}`,
        type: t.type,
        title: t.type === "income" ? `Receita: ${t.category}` : `Despesa: ${t.category}`,
        message: t.description || "Nova transação registrada",
        amount: t.amount,
        category: t.category,
        date: t.date,
        read: index > 5,
      }));

    return [...transactionNotifs, ...SYSTEM_NOTIFICATIONS].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#28a745" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/dashboard")}>
          <Icon name={Icons.back} size={IconSizes.large} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Olá, {user?.name || "Usuário"}!</Text>
          <Text style={styles.subtitle}>Notificações</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount} notificações</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptyStateSubtitle}>Você está em dia com suas notificações</Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((n) => (
              <View
                key={n.id}
                style={[styles.notificationItem, !n.read && styles.notificationItemUnread]}
              >
                <View style={styles.notificationTypeIndicator}>
                  <View
                    style={[
                      styles.typeIcon,
                      n.type === "income"
                        ? styles.typeIconIncome
                        : n.type === "expense"
                          ? styles.typeIconExpense
                          : styles.typeIconSystem,
                    ]}
                  >
                    <Text style={styles.typeIconText}>
                      {n.type === "income" ? "+" : n.type === "expense" ? "−" : "•"}
                    </Text>
                  </View>
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{n.title}</Text>
                  <Text style={styles.notificationMessage}>{n.message}</Text>
                  <Text style={styles.notificationDate}>{formatDate(n.date)}</Text>
                </View>
                {n.amount && (
                  <View style={styles.notificationAmount}>
                    <Text
                      style={[
                        styles.amountText,
                        n.type === "income" ? styles.amountTextIncome : styles.amountTextExpense,
                      ]}
                    >
                      {n.type === "income" ? "+" : "−"}{formatters.formatCurrency(n.amount)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: "#28a745", paddingHorizontal: 20, paddingVertical: 16, flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 12, padding: 4 },
  headerContent: { flex: 1 },
  greeting: { fontSize: 18, fontWeight: "600", color: "#fff" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  unreadBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  unreadBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 12 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 8 },
  emptyStateSubtitle: { fontSize: 14, color: "#999" },
  notificationsList: { gap: 12, marginBottom: 20 },
  notificationItem: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#e0e0e0", alignItems: "flex-start" },
  notificationItemUnread: { backgroundColor: "#f9f9f9", borderLeftColor: "#28a745" },
  notificationTypeIndicator: { marginRight: 12 },
  typeIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  typeIconIncome: { backgroundColor: "#d4edda" },
  typeIconExpense: { backgroundColor: "#f8d7da" },
  typeIconSystem: { backgroundColor: "#d1ecf1" },
  typeIconText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 },
  notificationMessage: { fontSize: 12, color: "#666", marginBottom: 6 },
  notificationDate: { fontSize: 11, color: "#999" },
  notificationAmount: { marginLeft: 8, justifyContent: "center" },
  amountText: { fontSize: 14, fontWeight: "600" },
  amountTextIncome: { color: "#28a745" },
  amountTextExpense: { color: "#dc3545" },
});
