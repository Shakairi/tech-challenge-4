import { Icons } from "@/constants/icons";
import { Category } from "@/types";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Alimentação",
    icon: Icons.food,
    color: "#FF6B6B",
  },
  {
    id: "transport",
    name: "Transporte",
    icon: Icons.car,
    color: "#4ECDC4",
  },
  {
    id: "entertainment",
    name: "Entretenimento",
    icon: Icons.movie,
    color: "#FFE66D",
  },
  {
    id: "health",
    name: "Saúde",
    icon: Icons.health,
    color: "#95E1D3",
  },
  {
    id: "education",
    name: "Educação",
    icon: Icons.book,
    color: "#A8D8EA",
  },
  {
    id: "shopping",
    name: "Compras",
    icon: Icons.shopping,
    color: "#FFB7C5",
  },
  {
    id: "utilities",
    name: "Contas",
    icon: Icons.lightbulb,
    color: "#DDA0DD",
  },
  {
    id: "salary",
    name: "Salário",
    icon: Icons.money,
    color: "#90EE90",
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: Icons.laptop,
    color: "#87CEEB",
  },
  {
    id: "investment",
    name: "Investimentos",
    icon: Icons.investment,
    color: "#FFD700",
  },
  {
    id: "other-income",
    name: "Outra Receita",
    icon: Icons.charts,
    color: "#C0C0C0",
  },
  {
    id: "other-expense",
    name: "Outras",
    icon: Icons.tag,
    color: "#A9A9A9",
  },
];

export function getCategoryById(id: string): Category | undefined {
  return DEFAULT_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryIcon(id: string): string {
  return getCategoryById(id)?.icon || Icons.tag;
}

export function getCategoryColor(id: string): string {
  return getCategoryById(id)?.color || "#A9A9A9";
}

export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name || "Outra";
}
