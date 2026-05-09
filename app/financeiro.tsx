/**
 * financeiro.tsx — otimizado
 *
 * Melhorias aplicadas:
 * 1. renderItem com useCallback — evita recriar função a cada render
 * 2. keyExtractor com useCallback — idem
 * 3. getItemLayout — FlatList não precisa medir cada item, scroll mais rápido
 * 4. windowSize reduzido — menos itens renderizados fora da tela
 * 5. maxToRenderPerBatch — controla quantos itens renderiza por vez
 * 6. removeClippedSubviews — remove da memória itens fora da viewport (Android)
 */
import FilterBar from "@/components/FilterBar";
import Icon from "@/components/Icon";
import TransactionCard from "@/components/TransactionCard";
import { Colors } from "@/constants/colors";
import { Icons, IconSizes } from "@/constants/icons";
import { useTransactions } from "@/context/TransactionsContext";
import { formatters } from "@/utils/formatters";
import { Transaction } from "@/types";
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

// ✅ Altura fixa do card — permite getItemLayout e evita medições
const CARD_HEIGHT = 72;
const CARD_MARGIN = 8;
const ITEM_HEIGHT = CARD_HEIGHT + CARD_MARGIN;

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
      return () => setFilter({ sortBy: "date", sortOrder: "desc" });
    }, [setFilter]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } catch {
      Alert.alert("Erro", "Falha ao atualizar transações");
    } finally {
      setRefreshing(false);
    }
  }, [refreshTransactions]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) loadMore();
  }, [loading, hasMore, loadMore]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert("Deletar Transação", "Tem certeza?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(id);
            } catch (err: any) {
              Alert.alert("Erro", err.message);
            }
          },
        },
      ]);
    },
    [deleteTransaction],
  );

  // ✅ useCallback: renderItem não é recriado a cada render do pai
  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <View style={styles.cardWrapper}>
        <TransactionCard
          transaction={item}
          onPress={() => router.navigate(`/transaction/${item.id}`)}
          onEdit={() => router.navigate(`/transaction/${item.id}`)}
          onDelete={() => handleDelete(item.id)}
        />
      </View>
    ),
    [router, handleDelete],
  );

  // ✅ useCallback: keyExtractor estável
  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  // ✅ getItemLayout: evita que FlatList meça cada item ao renderizar
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderFooter = useCallback(() => {
    if (!loading || transactions.length === 0) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [loading, transactions.length]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name={Icons.charts} size={IconSizes.xlarge} color="#ccc" />
        <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
        <Text style={styles.emptyText}>Comece adicionando suas transações</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.navigate("/transaction/add")}
        >
          <Text style={styles.addButtonText}>+ Adicionar Transação</Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/dashboard")}>
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
          onPress={() => router.navigate("/transaction/add")}
        >
          <Icon name={Icons.add} size={IconSizes.large} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <FilterBar filter={filter} onFilterChange={setFilter} />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}       // ✅ scroll mais rápido
        windowSize={5}                      // ✅ renderiza 5 "páginas" ao redor da viewport (padrão: 21)
        maxToRenderPerBatch={10}            // ✅ renderiza 10 itens por batch (padrão: 10)
        initialNumToRender={10}             // ✅ renderiza 10 itens na abertura
        removeClippedSubviews={true}        // ✅ remove itens fora da tela da memória (Android)
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  headerContent: { flex: 1, marginHorizontal: 12 },
  title: { fontSize: 20, fontWeight: "700", color: Colors.text, marginBottom: 8 },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  statBadge: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "#f5f5f5", borderRadius: 8 },
  statLabel: { fontSize: 10, color: "#999", marginBottom: 2 },
  statValueIncome: { fontSize: 12, fontWeight: "700", color: "#28a745" },
  statValueExpense: { fontSize: 12, fontWeight: "700", color: "#d32f2f" },
  statDivider: { width: 1, height: 32, backgroundColor: "#eee" },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.background, justifyContent: "center", alignItems: "center" },
  addIconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  filterSection: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 8 },
  listContent: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  cardWrapper: { marginBottom: CARD_MARGIN },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 8, textAlign: "center" },
  emptyText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24, textAlign: "center" },
  addButton: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  addButtonText: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  loaderContainer: { paddingVertical: 16, alignItems: "center" },
});
