
export const CATEGORY_CONFIG = {
  general: { label: "General", color: "#64748b" },       
  rent: { label: "Rent", color: "#0f172a" },              
  food: { label: "Food", color: "#22c55e" },             
  bills: { label: "Bills", color: "#3b82f6" },           
  transport: { label: "Transport", color: "#f59e0b" },    
  shopping: { label: "Shopping", color: "#ec4899" },      
  entertainment: { label: "Entertainment", color: "#8b5cf6" }, 
  other: { label: "Other", color: "#6b7280" },            
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_CONFIG);

export const categoryLabel = (key) => CATEGORY_CONFIG[key]?.label || key;
export const categoryColor = (key) => CATEGORY_CONFIG[key]?.color || "#94a3b8";
