import { Transaction, TransactionFilter } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export const transactionRepository = {
  async add(
    userId: string,
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...data,
      userId,
      date: Timestamp.fromDate(new Date(data.date)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Transaction;
  },

  async update(
    transactionId: string,
    userId: string,
    updates: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>,
  ): Promise<void> {
    const ref = doc(db, "transactions", transactionId);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error("Transação não encontrada");
    if (snap.data().userId !== userId) throw new Error("Sem permissão para editar esta transação");

    await updateDoc(ref, {
      ...updates,
      date: updates.date ? Timestamp.fromDate(new Date(updates.date)) : undefined,
      updatedAt: Timestamp.now(),
    });
  },

  async remove(transactionId: string, userId: string): Promise<void> {
    const ref = doc(db, "transactions", transactionId);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error("Transação não encontrada");
    if (snap.data().userId !== userId) throw new Error("Sem permissão para deletar esta transação");

    await deleteDoc(ref);
  },

  async findById(transactionId: string): Promise<Transaction | null> {
    const ref = doc(db, "transactions", transactionId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Transaction;
  },

  async list(
    userId: string,
    filter?: TransactionFilter,
    pageSize: number = 20,
    lastDoc?: any,
  ) {
    const constraints: QueryConstraint[] = [where("userId", "==", userId)];

    if (filter?.startDate) {
      constraints.push(where("date", ">=", Timestamp.fromDate(new Date(filter.startDate))));
    }
    if (filter?.endDate) {
      constraints.push(where("date", "<=", Timestamp.fromDate(new Date(filter.endDate))));
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

    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(collection(db, "transactions"), ...constraints);
    const snapshot = await getDocs(q);

    const transactions: Transaction[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Transaction;
    });

    const hasMore = transactions.length > pageSize;
    if (hasMore) transactions.pop();

    return {
      transactions,
      nextDoc: hasMore ? snapshot.docs[snapshot.docs.length - 2] : null,
      hasMore,
    };
  },
};
