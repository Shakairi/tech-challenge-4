import Icon from "@/components/Icon";
import { DEFAULT_CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/colors";
import { Icons, IconSizes } from "@/constants/icons";
import { useTransactions } from "@/context/TransactionsContext";
import { Transaction } from "@/types";
import { formatters } from "@/utils/formatters";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "./DatePicker";

interface TransactionFormProps {
  transaction?: Transaction;
  onSave: (
    data: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  onCancel: () => void;
}

export default function TransactionForm({
  transaction,
  onSave,
  onCancel,
}: TransactionFormProps) {
  const { uploadReceipt, deleteReceipt } = useTransactions();
  const isMountedRef = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [type, setType] = useState<"income" | "expense">(
    transaction?.type || "expense",
  );
  const [amount, setAmount] = useState(transaction?.amount.toString() || "");
  const [category, setCategory] = useState(transaction?.category || "");
  const [description, setDescription] = useState(
    transaction?.description || "",
  );
  const [selectedDate, setSelectedDate] = useState(
    transaction?.date || new Date(),
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(
    transaction?.receiptUrl,
  );
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>(
    transaction?.receiptFileName,
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Erro", "Digite um valor válido");
      return false;
    }
    if (!category) {
      Alert.alert("Erro", "Selecione uma categoria");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Erro", "Digite uma descrição");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave({
        amount: parseFloat(amount),
        category,
        description,
        type,
        date: selectedDate,
        ...(receiptUrl && {
          receiptUrl,
          receiptFileName: receiptFileName || "receipt",
        }),
      });

      if (isMountedRef.current) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      if (isMountedRef.current) {
        Alert.alert(
          "Erro",
          `Falha ao salvar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        );
        setIsLoading(false);
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find((c) => c.id === categoryId)?.name || "";
  };

  const handlePickReceipt = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setIsUploadingReceipt(true);

        try {
          const fileName = asset.fileName || `receipt_${Date.now()}.jpg`;
          const url = await uploadReceipt({
            uri: asset.uri,
            name: fileName,
            type: asset.type || "image/jpeg",
          });

          if (isMountedRef.current) {
            setReceiptUrl(url);
            setReceiptFileName(fileName);
            Alert.alert("Sucesso", "Recibo enviado com sucesso");
          }
        } catch (error) {
          if (isMountedRef.current) {
            Alert.alert(
              "Erro",
              `Falha ao enviar recibo: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            );
          }
        } finally {
          if (isMountedRef.current) {
            setIsUploadingReceipt(false);
          }
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao selecionar imagem");
    }
  };

  const handleRemoveReceipt = async () => {
    if (!receiptUrl) return;

    Alert.alert("Remover Recibo", "Deseja remover o recibo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            const url = new URL(receiptUrl);
            const filePath = url.pathname
              .split("/o/")[1]
              ?.split("?")[0]
              ?.replace(/%2F/g, "/");

            if (filePath) {
              await deleteReceipt(filePath);
            }

            setReceiptUrl(undefined);
            setReceiptFileName(undefined);
          } catch (error) {
            setReceiptUrl(undefined);
            setReceiptFileName(undefined);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {transaction ? "Editar Transação" : "Nova Transação"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "income" && styles.typeButtonActive,
              ]}
              onPress={() => setType("income")}
            >
              <Text style={styles.typeIcon}>📈</Text>
              <Text style={styles.typeText}>Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "expense" && styles.typeButtonActive,
              ]}
              onPress={() => setType("expense")}
            >
              <Text style={styles.typeIcon}>📉</Text>
              <Text style={styles.typeText}>Despesa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0,00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoria</Text>
          <TouchableOpacity
            style={styles.categorySelectButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.categorySelectText}>
              {category ? getCategoryName(category) : "Selecione uma categoria"}
            </Text>
            <Icon name={Icons.arrow} size={IconSizes.medium} color="#666" />
          </TouchableOpacity>

          <Modal visible={showCategoryModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.categoryModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Categorias</Text>
                  <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.categoryGrid}>
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        category === cat.id && styles.categoryOptionActive,
                      ]}
                      onPress={() => {
                        setCategory(cat.id);
                        setShowCategoryModal(false);
                      }}
                    >
                      <Icon
                        name={cat.icon}
                        size={IconSizes.large}
                        color="#333"
                      />
                      <Text style={styles.categoryOptionName}>{cat.name}</Text>
                      {category === cat.id && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setDatePickerOpen(true)}
          >
            <Text style={styles.dateButtonText}>
              {formatters.formatDate(selectedDate, "short")}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recibo (Opcional)</Text>
          {Platform.OS === "web" ? (
            <View style={styles.webNoticeContainer}>
              <Text style={styles.webNoticeText}>
                📱 Upload de recibos disponível apenas em dispositivos móveis
              </Text>
            </View>
          ) : receiptUrl ? (
            <View style={styles.receiptContainer}>
              <View style={styles.receiptInfo}>
                <Text style={styles.receiptIcon}>📄</Text>
                <View style={styles.receiptDetails}>
                  <Text style={styles.receiptName} numberOfLines={1}>
                    {receiptFileName}
                  </Text>
                  <Text style={styles.receiptUploaded}>
                    Enviado com sucesso
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveReceipt}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                isUploadingReceipt && styles.uploadButtonDisabled,
              ]}
              onPress={handlePickReceipt}
              disabled={isUploadingReceipt}
            >
              {isUploadingReceipt ? (
                <>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.uploadButtonText}>Enviando...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.uploadIcon}>📸</Text>
                  <Text style={styles.uploadButtonText}>Selecionar Recibo</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Digite uma descrição"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButtonBottom} onPress={onCancel}>
          <Text style={styles.cancelButtonBottomText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <DatePicker
        visible={datePickerOpen}
        value={selectedDate}
        onChange={setSelectedDate}
        onClose={() => setDatePickerOpen(false)}
      />
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
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelButton: {
    fontSize: 24,
    color: Colors.textTertiary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
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
    backgroundColor: Colors.white,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.borderLight,
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
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  categorySelectButton: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categorySelectText: {
    fontSize: 16,
    color: Colors.text,
  },
  arrowRight: {
    fontSize: 20,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  categoryModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
    paddingTop: 16,
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
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textTertiary,
  },
  categoryGrid: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  categoryOptionActive: {
    backgroundColor: Colors.primaryLight,
  },
  categoryOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryOptionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: "700",
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  calendarIcon: {
    fontSize: 20,
  },
  descriptionInput: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButtonBottom: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: "center",
  },
  cancelButtonBottomText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    paddingVertical: 16,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadIcon: {
    fontSize: 24,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  receiptContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  receiptInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  receiptIcon: {
    fontSize: 24,
  },
  receiptDetails: {
    flex: 1,
  },
  receiptName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  receiptUploaded: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    fontSize: 18,
    color: Colors.error,
    fontWeight: "700",
  },
  webNoticeContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  webNoticeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
});
