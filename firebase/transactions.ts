import { Transaction, TransactionFilter, User } from "@/types";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    QueryConstraint,
    setDoc,
    startAfter,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
} from "firebase/storage";
import { db, storage } from "./config";

export const transactionsService = {
  async addTransaction(
    userId: string,
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ) {
    try {
      const docRef = await addDoc(collection(db, "transactions"), {
        ...transaction,
        userId,
        date: Timestamp.fromDate(new Date(transaction.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return {
        id: docRef.id,
        ...transaction,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Transaction;
    } catch (error: any) {
      throw new Error(`Erro ao adicionar transação: ${error.message}`);
    }
  },

  async updateTransaction(
    transactionId: string,
    updates: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>,
  ) {
    try {
      const transactionRef = doc(db, "transactions", transactionId);
      await updateDoc(transactionRef, {
        ...updates,
        date: updates.date
          ? Timestamp.fromDate(new Date(updates.date))
          : undefined,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error: any) {
      throw new Error(`Erro ao atualizar transação: ${error.message}`);
    }
  },

  async deleteTransaction(transactionId: string) {
    try {
      await deleteDoc(doc(db, "transactions", transactionId));
      return { success: true };
    } catch (error: any) {
      throw new Error(`Erro ao deletar transação: ${error.message}`);
    }
  },

  async getTransaction(transactionId: string) {
    try {
      const docRef = doc(db, "transactions", transactionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Transaction;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Erro ao obter transação: ${error.message}`);
    }
  },

  async listTransactions(
    userId: string,
    filter?: TransactionFilter,
    pageSize: number = 20,
    lastDoc?: any,
  ) {
    try {
      const constraints: QueryConstraint[] = [where("userId", "==", userId)];

      if (filter?.startDate) {
        constraints.push(
          where("date", ">=", Timestamp.fromDate(new Date(filter.startDate))),
        );
      }
      if (filter?.endDate) {
        constraints.push(
          where("date", "<=", Timestamp.fromDate(new Date(filter.endDate))),
        );
      }
      if (filter?.type) {
        constraints.push(where("type", "==", filter.type));
      }
      if (filter?.categories && filter.categories.length > 0) {
        constraints.push(where("category", "in", filter.categories));
      }

      const sortField = filter?.sortBy === "amount" ? "amount" : "date";
      const sortOrder = filter?.sortOrder === "asc" ? "asc" : "desc";
      constraints.push(orderBy(sortField, sortOrder));
      constraints.push(limit(pageSize + 1));

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, "transactions"), ...constraints);
      const querySnapshot = await getDocs(q);

      const transactions: Transaction[] = [];
      let nextDoc = null;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        transactions.push({
          id: docSnap.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Transaction);
      });

      if (transactions.length > pageSize) {
        transactions.pop();
        nextDoc = querySnapshot.docs[querySnapshot.docs.length - 2];
      }

      return {
        transactions,
        nextDoc,
        hasMore: transactions.length === pageSize,
      };
    } catch (error: any) {
      throw new Error(`Erro ao listar transações: ${error.message}`);
    }
  },

  onTransactionsChange(
    userId: string,
    filter?: TransactionFilter,
    callback?: (transactions: Transaction[]) => void,
  ) {
    const constraints: QueryConstraint[] = [where("userId", "==", userId)];

    if (filter?.categories && filter.categories.length > 0) {
      constraints.push(where("category", "in", filter.categories));
    }
    if (filter?.type) {
      constraints.push(where("type", "==", filter.type));
    }

    constraints.push(orderBy("date", "desc"));

    const q = query(collection(db, "transactions"), ...constraints);

    return onSnapshot(q, (querySnapshot: any) => {
      const transactions: Transaction[] = [];
      querySnapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        transactions.push({
          id: docSnap.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Transaction);
      });
      callback?.(transactions);
    });
  },
};

const userService = {
  async setUserProfile(
    userId: string,
    userData: Omit<User, "id" | "createdAt">,
  ) {
    try {
      await setDoc(
        doc(db, "users", userId),
        {
          ...userData,
          createdAt: Timestamp.now(),
        },
        { merge: true },
      );
      return { success: true };
    } catch (error: any) {
      throw new Error(`Erro ao salvar perfil: ${error.message}`);
    }
  },

  async getUserProfile(userId: string) {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: userId,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as User;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Erro ao obter perfil: ${error.message}`);
    }
  },
};

export const storageService = {
  async uploadFile(
    userId: string,
    file: { uri: string; name: string; type: string },
  ) {
    try {
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);

      let blob: Blob;

      if (file.uri.startsWith("data:") || file.uri.startsWith("file://")) {
        const response = await fetch(file.uri);
        blob = await response.blob();
      } else {
        blob = new Blob([file.uri], { type: file.type });
      }

      const metadata = {
        contentType: file.type || "image/jpeg",
        cacheControl: "public, max-age=3600",
        customMetadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      };

      const snapshot = await uploadBytes(storageRef, blob, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return { downloadUrl, fileName: file.name };
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error.code === "storage/unauthorized") {
        throw new Error(
          "Acesso negado ao Storage. Verifique as permissões do Firebase.",
        );
      } else if (error.code === "storage/retry-limit-exceeded") {
        throw new Error("Timeout ao fazer upload. Tente novamente.");
      } else {
        throw new Error(
          `Erro ao fazer upload: ${error.message || "Erro desconhecido"}`,
        );
      }
    }
  },

  async deleteFile(filePath: string) {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      return { success: true };
    } catch (error: any) {
      console.error("Delete error:", error);
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  },
};
