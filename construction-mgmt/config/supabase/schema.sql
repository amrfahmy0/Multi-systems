-- ═══════════════════════════════════════════════════════════════════
-- Construction Management System - Database Schema
-- نظام إدارة التشطيبات السكنية
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Drop existing tables to allow safe re-runs ────────────────────
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS project_tasks CASCADE;
DROP TABLE IF EXISTS procurement_log CASCADE;
DROP TABLE IF EXISTS general_expenses CASCADE;
DROP TABLE IF EXISTS client_payments CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- ─── Drop existing types ───────────────────────────────────────────
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS doc_type CASCADE;

-- ─── Custom Types ──────────────────────────────────────────────────
CREATE TYPE project_status AS ENUM ('active', 'completed', 'on_hold', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('allocation', 'expense');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');
CREATE TYPE doc_type AS ENUM ('quotation', 'payment_certificate');

-- ─── Projects ──────────────────────────────────────────────────────
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  location TEXT,
  status project_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Client Payments ───────────────────────────────────────────────
CREATE TABLE client_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── General Expenses ──────────────────────────────────────────────
CREATE TABLE general_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Procurement Log ───────────────────────────────────────────────
CREATE TABLE procurement_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  invoice_urls TEXT[] NOT NULL DEFAULT '{}',
  procurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Project Tasks ─────────────────────────────────────────────────
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  phase TEXT NOT NULL,
  task_dates DATE[] NOT NULL DEFAULT '{}',
  status task_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Supervisor Logs ────────────────────────────────────────────────
CREATE TABLE supervisor_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_name TEXT NOT NULL,
  description TEXT NOT NULL,
  has_laborer BOOLEAN NOT NULL DEFAULT false,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Documents ─────────────────────────────────────────────────────
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type doc_type NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ───────────────────────────────────────────────────────
CREATE INDEX idx_client_payments_project ON client_payments(project_id);
CREATE INDEX idx_general_expenses_project ON general_expenses(project_id);
CREATE INDEX idx_procurement_log_project ON procurement_log(project_id);
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_supervisor_logs_project ON supervisor_logs(project_id);

-- ─── Disable RLS (Prototype Mode) ──────────────────────────────────
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE general_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
