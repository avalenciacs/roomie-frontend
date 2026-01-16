export const CATEGORY_CONFIG = {
  general: { label: "General", color: "#64748b" }, // slate
  rent: { label: "Rent", color: "#0f172a" }, // dark
  food: { label: "Food", color: "#22c55e" }, // green
  bills: { label: "Bills", color: "#3b82f6" }, // blue
  transport: { label: "Transport", color: "#f59e0b" }, // amber
  shopping: { label: "Shopping", color: "#ec4899" }, // pink
  entertainment: { label: "Entertainment", color: "#8b5cf6" }, // purple
  other: { label: "Other", color: "#6b7280" }, // gray
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_CONFIG);

export const normalizeCategory = (key) => {
  const k = String(key || "general")
    .toLowerCase()
    .trim();
  return CATEGORY_CONFIG[k] ? k : "general";
};

export const categoryLabel = (key) =>
  CATEGORY_CONFIG[normalizeCategory(key)]?.label || "General";
export const categoryColor = (key) =>
  CATEGORY_CONFIG[normalizeCategory(key)]?.color || "#94a3b8";
