export const TAX_RATE = 0.14; // 14% Value Added Tax (VAT)

// ─── Arabic UI Strings ─────────────────────────────────────────────
export const AR = {
  // App
  appName: "Multi Systems",
  appTagline: "إدارة المشاريع والمالية والمشتريات",

  // Navigation
  nav: {
    dashboard: "لوحة التحكم",
    projects: "المشاريع",
    financials: "السجل المالي",
    procurement: "المشتريات",
    tasks: "المهام",
    documents: "المستندات",
    settings: "الإعدادات",
  },

  // Project
  project: {
    title: "المشاريع",
    newProject: "مشروع جديد",
    name: "اسم المشروع",
    clientName: "اسم العميل",
    status: "الحالة",
    startDate: "تاريخ البدء",
    totalReceived: "إجمالي المستلم",
    totalExpenses: "إجمالي المصروفات",
    balance: "الرصيد",
    noProjects: "لا توجد مشاريع حالياً",
    createFirst: "قم بإنشاء مشروعك الأول",
  },

  // Project statuses
  status: {
    active: "نشط",
    completed: "مكتمل",
    on_hold: "متوقف",
    cancelled: "ملغي",
  } as Record<string, string>,

  // Financial
  financial: {
    title: "السجل المالي",
    clientPayments: "دفعات العميل",
    generalExpenses: "مصروفات عامة",
    pettyCash: "عهدة الموقع",
    amount: "المبلغ",
    date: "التاريخ",
    description: "الوصف",
    category: "الفئة",
    receiptRef: "مرجع الإيصال",
    addPayment: "إضافة دفعة",
    addExpense: "إضافة مصروف",
    addPettyCash: "إضافة عهدة",
    allocation: "تخصيص",
    expense: "مصروف",
    transactionType: "نوع المعاملة",
    receiptImage: "صورة الإيصال",
  },

  // Procurement
  procurement: {
    title: "سجل المشتريات",
    addItem: "إضافة صنف",
    itemName: "اسم الصنف",
    category: "الفئة",
    quantity: "الكمية",
    unitPrice: "سعر الوحدة",
    totalPrice: "الإجمالي",
    invoiceImage: "صورة الفاتورة",
    invoiceRequired: "صورة الفاتورة مطلوبة",
    noItems: "لا توجد مشتريات مسجلة",
  },

  // Tasks
  task: {
    title: "المهام والجدول الزمني",
    addTask: "إضافة مهمة",
    taskName: "اسم المهمة",
    phase: "المرحلة",
    expectedDays: "تاريخ المهمة",
    status: "الحالة",
    noTasks: "لا توجد مهام",
  },

  // Task statuses
  taskStatus: {
    pending: "قيد الانتظار",
    in_progress: "جاري التنفيذ",
    completed: "مكتمل",
    blocked: "معلّق",
  } as Record<string, string>,

  // Documents
  document: {
    title: "المستندات",
    generateQuotation: "إنشاء عرض سعر",
    generatePaymentCert: "إنشاء شهادة دفع",
    quotation: "عرض سعر",
    paymentCertificate: "شهادة دفع",
    downloadPdf: "تحميل PDF",
    companyName: "اسم الشركة",
    companyAddress: "عنوان الشركة",
    clientAddress: "عنوان العميل",
    items: "البنود",
    notes: "ملاحظات",
  },

  // General
  general: {
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    success: "تم بنجاح",
    confirm: "تأكيد",
    search: "بحث",
    filter: "تصفية",
    total: "الإجمالي",
    actions: "إجراءات",
    back: "رجوع",
    noData: "لا توجد بيانات",
    upload: "رفع",
    required: "مطلوب",
  },
} as const;

// ─── Expense Categories ────────────────────────────────────────────
export const EXPENSE_CATEGORIES: { value: string; label: string }[] = [];

// ─── Procurement Categories ────────────────────────────────────────
export const PROCUREMENT_CATEGORIES: { value: string; label: string }[] = [];

// ─── Task Phases ───────────────────────────────────────────────────
export const TASK_PHASES = [
  { value: "demolition", label: "هدم وإزالة" },
  { value: "structural", label: "أعمال إنشائية" },
  { value: "electrical", label: "أعمال كهرباء" },
  { value: "plumbing", label: "أعمال سباكة" },
  { value: "plastering", label: "محارة" },
  { value: "tiling", label: "بلاط وسيراميك" },
  { value: "painting", label: "دهانات" },
  { value: "carpentry", label: "نجارة" },
  { value: "aluminum", label: "ألومنيوم" },
  { value: "finishing", label: "تشطيبات نهائية" },
  { value: "cleanup", label: "تنظيف وتسليم" },
] as const;

// ─── Project Statuses ──────────────────────────────────────────────
export const PROJECT_STATUSES = [
  { value: "active", label: "نشط" },
  { value: "completed", label: "مكتمل" },
  { value: "on_hold", label: "متوقف" },
  { value: "cancelled", label: "ملغي" },
] as const;


// ─── Image Compression Config ──────────────────────────────────────
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5, // ~500KB for better readability of invoice text
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: "image/jpeg" as const, // iOS Safari canvas export doesn't fully support WebP, causing aggressive PNG downscaling
};

// ─── Table Headers ─────────────────────────────────────────────────
export const TABLE_HEADERS = {
  clientPayments: ["المبلغ", "التاريخ", "مرجع الإيصال", "إجراءات"],
  generalExpenses: ["المبلغ", "الفئة", "الوصف", "التاريخ", "إجراءات"],
  pettyCash: ["النوع", "المبلغ", "الوصف", "التاريخ", "الإيصال", "إجراءات"],
  procurement: ["الصنف", "الفئة", "الكمية", "سعر الوحدة", "الإجمالي", "الفاتورة", "إجراءات"],
  tasks: ["المهمة", "المرحلة", "الأيام المتوقعة", "الحالة", "إجراءات"],
} as const;
