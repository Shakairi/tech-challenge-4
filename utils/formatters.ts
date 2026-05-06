export const formatters = {
  formatCurrency(value: number, includeSymbol: boolean = true): string {
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

    return includeSymbol ? formatted : formatted.replace("R$", "").trim();
  },

  formatDate(
    date: Date | string,
    format: "short" | "long" | "time" = "short",
  ): string {
    const d = typeof date === "string" ? new Date(date) : date;

    if (format === "short") {
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }

    if (format === "long") {
      return d.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    if (format === "time") {
      return d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return d.toLocaleDateString("pt-BR");
  },

  formatDateForInput(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().split("T")[0];
  },

  formatNumber(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  truncate(text: string, length: number = 50): string {
    return text.length > length ? text.substring(0, length) + "..." : text;
  },

  formatFileName(fileName: string, maxLength: number = 30): string {
    if (fileName.length <= maxLength) return fileName;

    const extension = fileName.split(".").pop();
    const nameWithoutExt = fileName.replace("." + extension, "");
    const truncated = nameWithoutExt.substring(
      0,
      maxLength - extension!.length - 4,
    );

    return truncated + "..." + extension;
  },

  formatRelativeTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? "Agora" : `há ${diffMins} min`;
      }
      return `há ${diffHours}h`;
    }

    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`;

    return `há ${Math.floor(diffDays / 365)} anos`;
  },
};
