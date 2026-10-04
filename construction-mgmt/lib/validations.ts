import { z } from "zod";

// ─── Project ───────────────────────────────────────────────────────
export const projectSchema = z.object({
  name: z.string().min(1, "اسم المشروع مطلوب"),
  client_name: z.string().min(1, "اسم العميل مطلوب"),
  location: z.string().optional(),
  status: z.enum(["active", "completed", "on_hold", "cancelled"]),
  start_date: z.string().min(1, "تاريخ البدء مطلوب"),
});
export type ProjectFormData = z.infer<typeof projectSchema>;

// ─── Client Payment ────────────────────────────────────────────────
export const clientPaymentSchema = z.object({
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  payment_date: z.string().min(1, "التاريخ مطلوب"),
  receipt_ref: z.string().optional(),
});
export type ClientPaymentFormData = z.infer<typeof clientPaymentSchema>;

// ─── General Expense ───────────────────────────────────────────────
export const generalExpenseSchema = z.object({
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  category: z.string().min(1, "الفئة مطلوبة"),
  description: z.string().optional(),
  expense_date: z.string().min(1, "التاريخ مطلوب"),
});
export type GeneralExpenseFormData = z.infer<typeof generalExpenseSchema>;


// ─── Procurement ───────────────────────────────────────────────────
export const procurementSchema = z.object({
  item_name: z.string().min(1, "اسم الصنف مطلوب"),
  category: z.string().min(1, "الفئة مطلوبة"),
  quantity: z.number().positive("الكمية يجب أن تكون أكبر من صفر"),
  unit_price: z.number().min(0, "السعر يجب ألا يكون سالباً"),
  procurement_date: z.string().min(1, "التاريخ مطلوب"),
});
export type ProcurementFormData = z.infer<typeof procurementSchema>;

// ─── Task ──────────────────────────────────────────────────────────
export const taskSchema = z.object({
  task_name: z.string().min(1, "اسم المهمة مطلوب"),
  phase: z.string().min(1, "المرحلة مطلوبة"),
  task_dates: z.array(z.string()).min(1, "يجب تحديد يوم واحد على الأقل"),
  status: z.enum(["pending", "in_progress", "completed", "blocked"]),
});
export type TaskFormData = z.infer<typeof taskSchema>;

// ─── Supervisor Log ────────────────────────────────────────────────
export const supervisorLogSchema = z.object({
  work_date: z.string().min(1, "التاريخ مطلوب"),
  day_name: z.string().optional(),
  description: z.string().min(1, "الوصف مطلوب"),
  has_laborer: z.boolean().default(false),
});
export type SupervisorLogFormData = z.infer<typeof supervisorLogSchema>;

// ─── Document ──────────────────────────────────────────────────────
export const quotationSchema = z.object({
  save_title: z.string().optional(),
  quotation_date: z.string().min(1, "التاريخ مطلوب"),
  company_name: z.string().min(1, "اسم الشركة مطلوب"),
  client_name: z.string().min(1, "اسم العميل مطلوب"),
  project_name: z.string().min(1, "اسم المشروع مطلوب"),
  location: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, "الوصف مطلوب"),
      unit: z.string().min(1, "الوحدة مطلوبة"),
      quantity: z.number().positive(),
      unit_price: z.number().min(0),
    })
  ).min(1, "يجب إضافة بند واحد على الأقل"),
});
export type QuotationFormData = z.infer<typeof quotationSchema>;

export const paymentCertSchema = z.object({
  save_title: z.string().optional(),
  certificate_no: z.string().min(1, "رقم المستخلص مطلوب"),
  certificate_date: z.string().min(1, "التاريخ مطلوب"),
  company_name: z.string().min(1, "اسم الشركة مطلوب"),
  client_name: z.string().min(1, "اسم العميل مطلوب"),
  project_name: z.string().min(1, "اسم المشروع مطلوب"),
  location: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, "الوصف مطلوب"),
      unit: z.string().min(1, "الوحدة مطلوبة"),
      quantity_contract: z.number().min(0).optional(),
      quantity_previous: z.number().min(0),
      quantity_current: z.number().min(0),
      execution_percentage: z.number().min(0).optional(),
      unit_price: z.number().min(0),
    })
  ).min(1, "يجب إضافة بند واحد على الأقل"),
});
export type PaymentCertFormData = z.infer<typeof paymentCertSchema>;
