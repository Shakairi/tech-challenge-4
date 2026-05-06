// Icon constants - use throughout the app instead of emojis
export const Icons = {
  // Navigation
  home: "home",
  history: "history",
  notifications: "bell",
  plus: "plus",
  back: "chevron-left",
  next: "chevron-right",
  arrow: "chevron-right",
  menu: "menu",

  // Transactions
  income: "plus-circle",
  expense: "minus-circle",
  transaction: "swap-horizontal",
  wallet: "wallet",

  // Features
  charts: "chart-box",
  analytics: "chart-pie",
  categories: "tag-multiple",
  settings: "cog",
  user: "account-circle",
  filter: "filter-outline",
  reports: "chart-line",

  // Actions
  add: "plus",
  edit: "pencil",
  delete: "trash-can",
  search: "magnify",
  sort: "sort",

  // Status/Visibility
  visibility: "eye",
  visibilityOff: "eye-off",
  lock: "lock",
  unlock: "lock-open",

  // Status
  success: "check-circle",
  warning: "alert-circle",
  error: "close-circle",
  info: "information-outline",

  // Receipt & Files
  receipt: "receipt",
  upload: "cloud-upload",
  download: "cloud-download",
  document: "file-document",
  image: "image",

  // Financial
  money: "cash",
  percentage: "percent",
  trending: "trending-up",
  trendingUp: "trending-up",
  budget: "calculator",

  // Category Icons
  food: "silverware-fork-knife",
  car: "car",
  movie: "movie",
  health: "hospital-box",
  book: "book",
  shopping: "shopping",
  lightbulb: "lightbulb",
  laptop: "laptop",
  investment: "trending-up",
  tag: "tag",
};

export const IconFamily = {
  default: "MaterialCommunityIcons" as const,
  fontAwesome: "FontAwesome5" as const,
};

export const IconSizes = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
};
