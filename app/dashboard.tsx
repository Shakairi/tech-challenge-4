import Icon from "@/components/Icon";
import { Colors } from "@/constants/colors";
import { Icons, IconSizes } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionsContext";
import { formatters } from "@/utils/formatters";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { summary } = useTransactions();
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const chartData = [
    {
      value: Math.max(summary?.totalIncome || 0, 1),
      color: "#28a745",
      text: "Receita",
    },
    {
      value: Math.max(summary?.totalExpense || 0, 1),
      color: "#dc3545",
      text: "Despesa",
    },
  ];

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const balanceOpacity = useRef(new Animated.Value(0)).current;
  const balanceScale = useRef(new Animated.Value(0.9)).current;
  const graphicsOpacity = useRef(new Animated.Value(0)).current;
  const graphicsTranslateY = useRef(new Animated.Value(30)).current;
  const quickAccessOpacity = useRef(new Animated.Value(0)).current;
  const quickAccessTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(headerTranslateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(balanceOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(balanceScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(graphicsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(graphicsTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(quickAccessOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(quickAccessTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#28a745", "#1e7e34", "#155724"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar barStyle="dark-content" backgroundColor="#28a745" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <View style={styles.avatarPlaceholder}>
              <Icon name={Icons.user} size={IconSizes.large} color="#fff" />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Bem-vindo!</Text>
              <Text style={styles.userName}>{user?.name || "Usuário"}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push("/notifications")}
            >
              <Icon
                name={Icons.notifications}
                size={IconSizes.large}
                color="#fff"
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.balanceModal,
              {
                opacity: balanceOpacity,
                transform: [{ scale: balanceScale }],
              },
            ]}
          >
            <View style={styles.balanceLabelContainer}>
              <Text style={styles.balanceLabel}>Saldo Disponível</Text>
              <TouchableOpacity
                style={styles.visibilityButton}
                onPress={() => setIsBalanceVisible(!isBalanceVisible)}
              >
                <Icon
                  name={
                    isBalanceVisible ? Icons.visibility : Icons.visibilityOff
                  }
                  size={IconSizes.medium}
                  color="#28a745"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceValue}>
              {isBalanceVisible
                ? formatters.formatCurrency(summary?.balance || 0)
                : "•••••••"}
            </Text>

            <TouchableOpacity
              style={styles.transactionButton}
              onPress={() => router.push("/financeiro")}
            >
              <Text style={styles.transactionButtonText}>Ver Transações</Text>
            </TouchableOpacity>

            <View style={styles.actionButtonsGrid}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/transaction/add?type=income")}
              >
                <Icon
                  name={Icons.income}
                  size={IconSizes.large}
                  color="#28a745"
                />
                <Text style={styles.actionButtonText}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/transaction/add?type=expense")}
              >
                <Icon
                  name={Icons.expense}
                  size={IconSizes.large}
                  color="#dc3545"
                />
                <Text style={styles.actionButtonText}>Despesa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/financeiro")}
              >
                <Icon
                  name={Icons.history}
                  size={IconSizes.large}
                  color="#333"
                />
                <Text style={styles.actionButtonText}>Histórico</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.graphicsModal,
              {
                opacity: graphicsOpacity,
                transform: [{ translateY: graphicsTranslateY }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.graphicsSection}
              onPress={() => router.push("/reports")}
              activeOpacity={0.7}
            >
              <View style={styles.graphicsHeader}>
                <Text style={styles.graphicsTitle}>Resumo Financeiro</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.graphicsLink}>Ver mais</Text>
                  <Icon
                    name={Icons.arrow}
                    size={IconSizes.medium}
                    color="#28a745"
                  />
                </View>
              </View>

              <View style={styles.chartContainer}>
                <PieChart
                  data={chartData}
                  donut
                  radius={70}
                  innerRadius={50}
                  centerLabelComponent={() => (
                    <View style={styles.chartCenter}>
                      <Text style={styles.chartCenterText}>
                        {formatters.formatCurrency(summary?.balance || 0)}
                      </Text>
                      <Text style={styles.chartCenterLabel}>Saldo</Text>
                    </View>
                  )}
                />
              </View>

              <View style={styles.graphicsStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Receita</Text>
                  <Text style={styles.statValueIncome}>
                    {formatters.formatCurrency(summary?.totalIncome || 0)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Despesa</Text>
                  <Text style={styles.statValueExpense}>
                    {formatters.formatCurrency(summary?.totalExpense || 0)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.quickAccessModal,
              {
                opacity: quickAccessOpacity,
                transform: [{ translateY: quickAccessTranslateY }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.quickAccessButton}
              onPress={() => router.push("/financeiro")}
            >
              <View style={styles.quickAccessContent}>
                <Text style={styles.quickAccessTitle}>Histórico Completo</Text>
                <Text style={styles.quickAccessSubtitle}>
                  Ver todas as transações
                </Text>
              </View>
              <Icon
                name={Icons.arrow}
                size={IconSizes.medium}
                color="#28a745"
              />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#28a745" },
  safeAreaView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: { fontSize: 32 },
  headerContent: { flex: 1 },
  notificationButton: {
    padding: 8,
    marginLeft: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  userName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  balanceModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 8,
  },
  balanceLabelContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceToggleButton: {
    marginLeft: 8,
    padding: 4,
  },
  visibilityButton: {
    marginLeft: 8,
    padding: 4,
  },
  balanceToggleIcon: {
    fontSize: 18,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#28a745",
    textAlign: "center",
    marginBottom: 20,
  },
  transactionButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  transactionButtonText: { color: "#28a745", fontSize: 14, fontWeight: "600" },
  actionButtonsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  actionButtonIcon: { fontSize: 32, marginBottom: 0 },
  actionButtonText: {
    fontSize: 11,
    color: "#333",
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  graphicsModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  graphicsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  graphicsTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  graphicsLink: { fontSize: 12, color: "#28a745", fontWeight: "600" },
  graphicsSection: {
    flex: 1,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  chartCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenterText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
    textAlign: "center",
  },
  chartCenterLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  graphicsStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: { fontSize: 12, color: "#999", marginBottom: 4 },
  statValueIncome: { fontSize: 18, fontWeight: "bold", color: "#28a745" },
  statValueExpense: { fontSize: 18, fontWeight: "bold", color: "#d32f2f" },
  statDivider: { width: 1, backgroundColor: "#eee" },
  quickAccessModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAccessButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  quickAccessContent: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontSize: 13,
    color: "#999",
  },
  quickAccessArrow: {
    fontSize: 20,
    color: "#28a745",
    marginLeft: 12,
  },
});
