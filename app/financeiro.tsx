import FilterBar from "@/components/FilterBar";
import Icon from "@/components/Icon";
import TransactionCard from "@/components/TransactionCard";
import { Colors } from "@/constants/colors";
import { Icons, IconSizes } from "@/constants/icons";
import { useTransactions } from "@/context/TransactionsContext";
import { formatters } from "@/utils/formatters";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Financeiro() {
  const router = useRouter();
  const {
    transactions,
    loading,
    error,
    filter,
    setFilter,
    deleteTransaction,
    loadMore,
    hasMore,
    refreshTransactions,
    summary,
  } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setFilter({
          sortBy: "date",
          sortOrder: "desc",
        });
      };
    }, [setFilter]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } catch (err) {
      Alert.alert("Erro", "Falha ao atualizar transações");
    } finally {
      setRefreshing(false);
    }
  }, [refreshTransactions]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore();
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      "Deletar Transação",
      "Tem certeza que deseja deletar esta transação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
              Alert.alert("Sucesso", "Transação deletada");
            } catch (err: any) {
              Alert.alert("Erro", `Falha ao deletar: ${err.message}`);
            }
          },
        },
      ],
    );
  };

  const handleEditTransaction = (transactionId: string) => {
    router.navigate(`/transaction/${transactionId}`);
  };

  const handleAddTransaction = () => {
    router.navigate("/transaction/add");
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name={Icons.charts} size={IconSizes.xlarge} color="#ccc" />
      <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
      <Text style={styles.emptyText}>Comece adicionando suas transações</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
        <Text style={styles.addButtonText}>+ Adicionar Transação</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name={Icons.warning} size={IconSizes.xlarge} color="#ff9800" />
      <Text style={styles.errorTitle}>Erro ao carregar transações</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingIndicator = () => (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#1e9038" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/dashboard")}
        >
          <Icon name={Icons.back} size={IconSizes.large} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Histórico</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Entrada</Text>
              <Text style={styles.statValueIncome}>
                {formatters.formatCurrency(summary?.totalIncome || 0)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Saída</Text>
              <Text style={styles.statValueExpense}>
                {formatters.formatCurrency(summary?.totalExpense || 0)}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={handleAddTransaction}
        >
          <Icon name={Icons.add} size={IconSizes.large} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <FilterBar filter={filter} onFilterChange={setFilter} />
      </View>

      {error && !loading ? (
        renderErrorState()
      ) : loading && transactions.length === 0 ? (
        renderLoadingIndicator()
      ) : (
        <FlatList
          data={transactions}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <TransactionCard
                transaction={item}
                onPress={() => router.navigate(`/transaction/${item.id}`)}
                onEdit={() => handleEditTransaction(item.id)}
                onDelete={() => handleDeleteTransaction(item.id)}
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={!loading ? renderEmptyState() : null}
          ListFooterComponent={
            loading && transactions.length > 0 ? renderLoadingIndicator() : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statBadge: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 2,
  },
  statValueIncome: {
    fontSize: 12,
    fontWeight: "700",
    color: "#28a745",
  },
  statValueExpense: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d32f2f",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#eee",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    color: Colors.text,
  },
  addIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    fontSize: 20,
  },
  filterSection: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
});
