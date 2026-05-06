export const validators = {
  isValidEmail(email: string): boolean {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  },

  isValidAmount(amount: any): boolean {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 999999.99;
  },

  isValidCategory(category: string): boolean {
    return !!(category && category.trim().length > 0);
  },

  isValidDate(date: Date): boolean {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return date <= now;
  },

  isValidDescription(description: string): boolean {
    return !!(
      description &&
      description.trim().length > 0 &&
      description.length <= 500
    );
  },

  isValidType(type: string): boolean {
    return type === "income" || type === "expense";
  },

  isValidReceipt(file: { size?: number; type?: string }): boolean {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "image/heic",
    ];

    if (file.size && file.size > maxSize) {
      return false;
    }

    if (file.type && !allowedTypes.includes(file.type)) {
      return false;
    }

    return true;
  },
};

export const getValidationError = (
  field: string,
  value: any,
): string | null => {
  switch (field) {
    case "amount":
      if (!value) return "Valor é obrigatório";
      if (!validators.isValidAmount(value))
        return "Valor deve ser positivo (máximo 999999.99)";
      break;
    case "category":
      if (!validators.isValidCategory(value)) return "Categoria é obrigatória";
      break;
    case "date":
      if (!value) return "Data é obrigatória";
      if (!validators.isValidDate(new Date(value)))
        return "Data não pode ser no futuro";
      break;
    case "description":
      if (!validators.isValidDescription(value))
        return "Descrição é obrigatória (máximo 500 caracteres)";
      break;
    case "type":
      if (!validators.isValidType(value)) return "Tipo inválido";
      break;
  }
  return null;
};
