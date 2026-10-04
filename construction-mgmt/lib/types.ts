// ─── Database Types ────────────────────────────────────────────────
// Mirrors the Supabase PostgreSQL schema

export type ProjectStatus = "active" | "completed" | "on_hold" | "cancelled";
export type TransactionType = "allocation" | "expense";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type DocType = "quotation" | "payment_certificate";

export interface Project {
  id: string;
  name: string;
  client_name: string;
  location: string | null;
  status: ProjectStatus;
  start_date: string;
  created_at: string;
}

export interface ClientPayment {
  id: string;
  project_id: string;
  amount: number;
  payment_date: string;
  receipt_ref: string | null;
  created_at: string;
}

export interface GeneralExpense {
  id: string;
  project_id: string;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
  created_at: string;
}


export interface ProcurementItem {
  id: string;
  project_id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  invoice_urls: string[];
  procurement_date: string;
  created_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  task_name: string;
  phase: string;
  task_dates: string[];
  status: TaskStatus;
  created_at: string;
}

export interface SupervisorLog {
  id: string;
  project_id: string;
  work_date: string;
  day_name: string;
  description: string;
  has_laborer: boolean;
  is_paid: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  doc_type: DocType;
  content: Record<string, unknown>;
  generated_at: string;
}

// ─── Aggregated Types ──────────────────────────────────────────────
export interface ProjectWithFinancials extends Project {
  total_received: number;
  total_expenses: number;
  balance: number;
}

export interface FinancialLedgerEntry {
  id: string;
  type: "payment" | "expense" | "petty_cash";
  amount: number;
  date: string;
  description: string;
  category?: string;
}
