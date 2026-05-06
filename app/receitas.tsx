import Chart from "@/components/Chart";
import Icon from "@/components/Icon";
import { Icons, IconSizes } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionsContext";
import { useLogout } from "@/hooks/useLogout";
import { generateChartData, PeriodType } from "@/utils/data";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

export default function Receitas() {
  const router = useRouter();
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const handleLogout = useLogout();
  const [period, setPeriod] = useState<PeriodType>("1M");

  const chartData = generateChartData(transactions, "income", period);
  const { width } = useWindowDimensions();

  const totalReceitas = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Bem-vindo, {user?.name || "Usuário"}!
          </Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.smalltitle}>Gráfico de Receitas</Text>
          <Text style={styles.maintitle}>
            R${" "}
            {(totalReceitas / 100).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Text>

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

          <Chart data={chartData} width={width} />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/financeiro")}
          >
            <Icon
              name={Icons.charts}
              size={IconSizes.medium}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.buttonText}>Ver Transações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLogout}
          >
            <Text style={styles.secondaryButtonText}>🚪 Sair</Text>
          </TouchableOpacity>
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

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  header: {
    marginBottom: 32,
  },

  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e9038",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
  },

  chartContainer: {
    marginBottom: 32,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },

  smalltitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },

  maintitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e9038",
    marginBottom: 16,
  },

  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
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
    backgroundColor: "#1e9038",
    borderColor: "#1e9038",
  },

  periodText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },

  periodTextActive: {
    color: "#fff",
  },

  actionsContainer: {
    gap: 12,
    marginTop: 24,
  },

  primaryButton: {
    backgroundColor: "#1e9038",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
  },
});
