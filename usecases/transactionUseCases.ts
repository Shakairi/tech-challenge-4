import { transactionRepository } from "@/repositories/transactionRepository";
import { storageRepository } from "@/repositories/storageRepository";
import { Transaction, TransactionFilter } from "@/types";

export const transactionUseCases = {
  async add(
    userId: string,
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> {
    if (!userId) throw new Error("Usuário não autenticado");
    if (data.amount <= 0) throw new Error("O valor deve ser maior que zero");
    if (!data.category) throw new Error("Categoria é obrigatória");

    return transactionRepository.add(userId, data);
  },

  async update(
    transactionId: string,
    userId: string,
    updates: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>,
  ): Promise<void> {
    if (!userId) throw new Error("Usuário não autenticado");
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error("O valor deve ser maior que zero");
    }

    return transactionRepository.update(transactionId, userId, updates);
  },

  async remove(transactionId: string, userId: string): Promise<void> {
    if (!userId) throw new Error("Usuário não autenticado");
    return transactionRepository.remove(transactionId, userId);
  },

  async getById(transactionId: string): Promise<Transaction | null> {
    return transactionRepository.findById(transactionId);
  },

  async list(
    userId: string,
    filter?: TransactionFilter,
    pageSize?: number,
    lastDoc?: any,
  ) {
    if (!userId) throw new Error("Usuário não autenticado");
    return transactionRepository.list(userId, filter, pageSize, lastDoc);
  },

  async uploadReceipt(
    userId: string,
    file: { uri: string; name: string; type: string },
  ): Promise<string> {
    if (!userId) throw new Error("Usuário não autenticado");
    const { downloadUrl } = await storageRepository.upload(userId, file);
    return downloadUrl;
  },

  async deleteReceipt(filePath: string): Promise<void> {
    return storageRepository.remove(filePath);
  },
};
