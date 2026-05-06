interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date | string;
  receipt?: string;
}

export type PeriodType = "1M" | "3M" | "6M" | "12M";

interface ChartDataPoint {
  value: number;
}

export const generateChartData = (
  transactions: Transaction[],
  type: "income" | "expense",
  period: PeriodType,
): ChartDataPoint[] => {
  const filteredByType = transactions.filter((t) => t.type === type);

  const now = new Date();
  const monthsMap: { [key in PeriodType]: number } = {
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "12M": 12,
  };

  const months = monthsMap[period];
  const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

  const filteredByPeriod = filteredByType.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= now;
  });

  const grouped: { [key: string]: number } = {};

  filteredByPeriod.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    let key: string;

    if (period === "1M") {
      key = transactionDate.toISOString().split("T")[0];
    } else if (period === "3M" || period === "6M") {
      const weekStart = new Date(transactionDate);
      weekStart.setDate(transactionDate.getDate() - transactionDate.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key =
        transactionDate.getFullYear() +
        "-" +
        String(transactionDate.getMonth() + 1).padStart(2, "0");
    }

    grouped[key] = (grouped[key] || 0) + transaction.amount;
  });

  const chartData: ChartDataPoint[] = Object.values(grouped)
    .sort((a, b) => a - b)
    .map((value) => ({ value }));

  return chartData.length > 0 ? chartData : [];
};
