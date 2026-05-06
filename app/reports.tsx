import Icon from "@/components/Icon";
import { Icons, IconSizes } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionsContext";
import { PeriodType } from "@/utils/data";
import { formatters } from "@/utils/formatters";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";

interface CategoryAnalysis {
  category: string;
  amount: number;
  percentage: number;
}

export default function Reports() {
  const router = useRouter();
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState<PeriodType>("1M");

  const getDateRange = (periodType: PeriodType) => {
    const now = new Date();
    const startDate = new Date();

    switch (periodType) {
      case "1M":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6M":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "12M":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { startDate, endDate: now };
  };

  const getTransactionsInPeriod = () => {
    const { startDate, endDate } = getDateRange(period);
    return transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate,
    );
  };

  const getCategoryBreakdown = (type: "income" | "expense") => {
    const periodTransactions = getTransactionsInPeriod();
    const typeTransactions = periodTransactions.filter((t) => t.type === type);
    const total = typeTransactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap: { [key: string]: number } = {};
    typeTransactions.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const calculateStats = () => {
    const periodTransactions = getTransactionsInPeriod();
    const income = periodTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    return { income, expense, balance, count: periodTransactions.length };
  };

  const getCategoryChartData = (
    categories: CategoryAnalysis[],
    colors: string[],
  ) => {
    return categories.map((cat, index) => ({
      value: Math.max(cat.amount, 1),
      label: cat.category,
      color: colors[index % colors.length],
    }));
  };

  const stats = calculateStats();
  const incomeByCategory = getCategoryBreakdown("income");
  const expenseByCategory = getCategoryBreakdown("expense");

  const incomeColors = ["#28a745", "#20c997", "#17a2b8", "#007bff", "#6f42c1"];
  const expenseColors = ["#dc3545", "#fd7e14", "#ffc107", "#6c757d", "#343a40"];

  const incomeChartData = getCategoryChartData(incomeByCategory, incomeColors);
  const expenseChartData = getCategoryChartData(
    expenseByCategory,
    expenseColors,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name={Icons.back} size={IconSizes.large} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Relatórios</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.periodContainer}>
          <View style={styles.periodSelector}>
            {(["1M", "3M", "6M", "12M"] as PeriodType[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodButton,
                  period === p && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.periodText,
                    period === p && styles.periodTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumo do Período</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Receita</Text>
              <Text style={styles.statValueIncome}>
                {formatters.formatCurrency(stats.income)}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Despesa</Text>
              <Text style={styles.statValueExpense}>
                {formatters.formatCurrency(stats.expense)}
              </Text>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Líquido</Text>
            <Text
              style={[
                styles.balanceValue,
                {
                  color: stats.balance >= 0 ? "#28a745" : "#d32f2f",
                },
              ]}
            >
              {formatters.formatCurrency(stats.balance)}
            </Text>
            <Text style={styles.transactionCount}>
              {stats.count} transações
            </Text>
          </View>
        </View>

        {incomeByCategory.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Distribuição de Receitas</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={incomeChartData}
                radius={100}
                focusOnPress={true}
                donut
                innerRadius={70}
              />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Receitas por Categoria
            </Text>

            {incomeByCategory.map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.categoryPercentage}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: "#28a745",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryAmount}>
                  {formatters.formatCurrency(item.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {expenseByCategory.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Distribuição de Despesas</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={expenseChartData}
                radius={100}
                focusOnPress={true}
                donut
                innerRadius={70}
              />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Despesas por Categoria
            </Text>

            {expenseByCategory.map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.categoryPercentage}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: "#d32f2f",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryAmount}>
                  {formatters.formatCurrency(item.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>

          {stats.balance > 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightIcon}>✅</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Bom desempenho!</Text>
                <Text style={styles.insightText}>
                  Você teve um saldo positivo neste período.
                </Text>
              </View>
            </View>
          )}

          {stats.balance < 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightIcon}>⚠️</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Atenção</Text>
                <Text style={styles.insightText}>
                  Suas despesas superaram as receitas.
                </Text>
              </View>
            </View>
          )}

          {expenseByCategory.length > 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightIcon}>📊</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>
                  Maior gasto: {expenseByCategory[0].category}
                </Text>
                <Text style={styles.insightText}>
                  {formatters.formatCurrency(expenseByCategory[0].amount)} (
                  {expenseByCategory[0].percentage.toFixed(1)}% do total)
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 20,
    color: "#333",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },

  periodContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },

  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  periodButtonActive: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },

  periodText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },

  periodTextActive: {
    color: "#fff",
  },

  summarySection: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  statLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },

  statValueIncome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
  },

  statValueExpense: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d32f2f",
  },

  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  balanceLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },

  balanceValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },

  transactionCount: {
    fontSize: 12,
    color: "#bbb",
  },

  analysisSection: {
    padding: 16,
  },

  categoryItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  categoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  categoryPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
  },

  categoryBar: {
    height: 6,
    backgroundColor: "#e8e8e8",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },

  categoryBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  categoryAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },

  insightsSection: {
    padding: 16,
  },

  insightCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  insightIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },

  insightContent: {
    flex: 1,
  },

  insightTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },

  insightText: {
    fontSize: 12,
    color: "#999",
  },

  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
