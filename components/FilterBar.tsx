import Icon from "@/components/Icon";
import { DEFAULT_CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { Icons, IconSizes } from "@/constants/icons";
import { TransactionFilter } from "@/types";
import { formatters } from "@/utils/formatters";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "./DatePicker";

interface FilterBarProps {
  filter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
}

export default function FilterBar({ filter, onFilterChange }: FilterBarProps) {
  const [showModal, setShowModal] = useState(false);
  const [localFilter, setLocalFilter] = useState<TransactionFilter>(filter);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  const handleApplyFilter = () => {
    onFilterChange(localFilter);
    setShowModal(false);
  };

  const handleResetFilter = () => {
    const resetFilter: TransactionFilter = {
      sortBy: "date",
      sortOrder: "desc",
    };
    setLocalFilter(resetFilter);
    onFilterChange(resetFilter);
    setShowModal(false);
  };

  const toggleCategory = (categoryId: string) => {
    const categories = localFilter.categories || [];
    const updated = categories.includes(categoryId)
      ? categories.filter((c) => c !== categoryId)
      : [...categories, categoryId];
    setLocalFilter({ ...localFilter, categories: updated });
  };

  const toggleType = (type: "income" | "expense") => {
    setLocalFilter({
      ...localFilter,
      type: localFilter.type === type ? undefined : type,
    });
  };

  const hasActiveFilters =
    (localFilter.categories && localFilter.categories.length > 0) ||
    localFilter.type ||
    localFilter.startDate ||
    localFilter.endDate ||
    localFilter.searchText;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.filterButton,
          hasActiveFilters && styles.filterButtonActive,
        ]}
        onPress={() => setShowModal(true)}
      >
        <Icon name={Icons.filter} size={IconSizes.medium} color="#333" />
        <Text style={styles.filterText}>
          {hasActiveFilters ? "Filtros Ativos" : "Filtros"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    localFilter.type === "income" && styles.typeButtonActive,
                  ]}
                  onPress={() => toggleType("income")}
                >
                  <Icon
                    name={Icons.income}
                    size={IconSizes.large}
                    color="#28a745"
                  />
                  <Text style={styles.typeText}>Receita</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    localFilter.type === "expense" && styles.typeButtonActive,
                  ]}
                  onPress={() => toggleType("expense")}
                >
                  <Icon
                    name={Icons.expense}
                    size={IconSizes.large}
                    color="#dc3545"
                  />
                  <Text style={styles.typeText}>Despesa</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categorias</Text>
              <View style={styles.categoriesGrid}>
                {DEFAULT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      localFilter.categories?.includes(category.id) &&
                        styles.categoryButtonActive,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Icon
                      name={category.icon}
                      size={IconSizes.large}
                      color="#333"
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Buscar</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por descrição..."
                placeholderTextColor="#999"
                value={localFilter.searchText || ""}
                onChangeText={(text) =>
                  setLocalFilter({
                    ...localFilter,
                    searchText: text || undefined,
                  })
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Período</Text>
              <View style={styles.dateContainer}>
                <TouchableOpacity
                  style={styles.dateInputButton}
                  onPress={() => setStartDatePickerOpen(true)}
                >
                  <Text style={styles.dateLabel}>De</Text>
                  <View style={styles.dateInputField}>
                    <Text style={styles.dateInputText}>
                      {localFilter.startDate
                        ? formatters.formatDate(localFilter.startDate, "short")
                        : "DD/MM/YYYY"}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dateInputButton}
                  onPress={() => setEndDatePickerOpen(true)}
                >
                  <Text style={styles.dateLabel}>Até</Text>
                  <View style={styles.dateInputField}>
                    <Text style={styles.dateInputText}>
                      {localFilter.endDate
                        ? formatters.formatDate(localFilter.endDate, "short")
                        : "DD/MM/YYYY"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ordenação</Text>
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    localFilter.sortBy === "date" && styles.sortButtonActive,
                  ]}
                  onPress={() =>
                    setLocalFilter({
                      ...localFilter,
                      sortBy: "date",
                    })
                  }
                >
                  <Text style={styles.sortText}>Data</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    localFilter.sortBy === "amount" && styles.sortButtonActive,
                  ]}
                  onPress={() =>
                    setLocalFilter({
                      ...localFilter,
                      sortBy: "amount",
                    })
                  }
                >
                  <Text style={styles.sortText}>Valor</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sortOrderContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    localFilter.sortOrder === "asc" &&
                      styles.sortOrderButtonActive,
                  ]}
                  onPress={() =>
                    setLocalFilter({
                      ...localFilter,
                      sortOrder: "asc",
                    })
                  }
                >
                  <Text style={styles.sortOrderText}>↑ Ascendente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    localFilter.sortOrder === "desc" &&
                      styles.sortOrderButtonActive,
                  ]}
                  onPress={() =>
                    setLocalFilter({
                      ...localFilter,
                      sortOrder: "desc",
                    })
                  }
                >
                  <Text style={styles.sortOrderText}>↓ Descendente</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilter}
            >
              <Text style={styles.resetButtonText}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilter}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DatePicker
        visible={startDatePickerOpen}
        value={localFilter.startDate}
        onChange={(date) => setLocalFilter({ ...localFilter, startDate: date })}
        onClose={() => setStartDatePickerOpen(false)}
      />

      <DatePicker
        visible={endDatePickerOpen}
        value={localFilter.endDate}
        onChange={(date) => setLocalFilter({ ...localFilter, endDate: date })}
        onClose={() => setEndDatePickerOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    alignSelf: "flex-start",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textTertiary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    width: "30%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  dateContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateInputButton: {
    flex: 1,
  },
  dateInputField: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  dateInputText: {
    fontSize: 14,
    color: Colors.text,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.text,
  },
  sortContainer: {
    flexDirection: "row",
    gap: 12,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  sortButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  sortText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  sortOrderContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  sortOrderButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  sortOrderButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  sortOrderText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
});
