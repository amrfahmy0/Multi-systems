"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileText, Download, Plus, Trash2, FileSpreadsheet, Save, FolderOpen, FileCheck, Home, ChevronLeft } from "lucide-react";
import { AR, TAX_RATE } from "@/config/constants";
import { formatCurrency } from "@/lib/utils";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationSchema, paymentCertSchema, type QuotationFormData, type PaymentCertFormData } from "@/lib/validations";
import { useToast } from "@/components/toast-provider";
import { useProjects } from "@/lib/hooks/use-projects";
import type { Project } from "@/lib/types";
import { generateQuotationExcel } from "@/features/documents/generate-excel";
import { createClient } from "@/config/supabase/client";
import { ConfirmModal } from "@/components/modal";
import { NumberInput } from "@/components/ui/number-input";

export default function DocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeDoc, setActiveDoc] = useState<"quotation" | "payment_cert">("quotation");
  const { addToast } = useToast();
  const { fetchProjectWithFinancials } = useProjects();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjectWithFinancials(projectId).then(setProject).catch(console.error);
  }, [projectId, fetchProjectWithFinancials]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold bg-white/70 backdrop-blur-md border border-zinc-200/50 shadow-sm px-4 py-2.5 rounded-2xl w-fit mb-2 max-w-full">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-primary-600 transition-colors">
          <Home size={16} />
          <span>{AR.nav.dashboard}</span>
        </Link>
        <ChevronLeft size={16} className="text-zinc-300 rtl:rotate-180" />
        <Link href={`/projects/${projectId}`} className="text-zinc-500 hover:text-primary-600 transition-colors">
          {project?.name || AR.project.title}
        </Link>
        <ChevronLeft size={16} className="text-zinc-300 rtl:rotate-180" />
        <div className="flex items-center gap-2 text-primary-700 bg-primary-50 px-3 py-1 rounded-lg">
          <span>{AR.document.title}</span>
        </div>
      </div>

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white shadow-xl mb-4">
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-black tracking-tight text-white">{AR.document.title}</h1>
              <p className="text-zinc-400 text-sm mt-1">إصدار وإدارة عروض الأسعار والمستخلصات المالية للمشروع</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 mb-2 overflow-x-auto bg-zinc-100/80 rounded-2xl border border-zinc-200/60 w-max max-w-full shadow-sm">
        <button
          onClick={() => setActiveDoc("quotation")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
            activeDoc === "quotation"
              ? "bg-white text-primary-600 shadow-sm border border-zinc-200/50"
              : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 border border-transparent"
          }`}
        >
          <FileText size={16} />
          {AR.document.quotation}
        </button>
        <button
          onClick={() => setActiveDoc("payment_cert")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
            activeDoc === "payment_cert"
              ? "bg-white text-primary-600 shadow-sm border border-zinc-200/50"
              : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 border border-transparent"
          }`}
        >
          <FileCheck size={16} />
          {AR.document.paymentCertificate}
        </button>
      </div>

      {activeDoc === "quotation" && <QuotationForm project={project} />}
      {activeDoc === "payment_cert" && <PaymentCertForm project={project} />}
    </div>
  );
}

function QuotationForm({ project }: { project: Project | null }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedQuotations, setSavedQuotations] = useState<any[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadQuotations = async () => {
    if (!project) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("project_id", project.id)
      .eq("doc_type", "quotation")
      .order("generated_at", { ascending: false });
    if (data) setSavedQuotations(data);
  };

  useEffect(() => {
    loadQuotations();
  }, [project]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      quotation_date: new Date().toISOString().split("T")[0],
      company_name: "شركة مالتي سيستيمز للهندسة والتجارة",
      client_name: "",
      project_name: "",
      location: "",
      notes: "",
      items: [{ description: "", unit: "م٢", quantity: 0, unit_price: 0 }],
    },
  });

  useEffect(() => {
    if (project) {
      setValue("client_name", project.client_name || "");
      setValue("project_name", project.name || "");
      setValue("location", project.location || "");
    }
  }, [project, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const total = watchedItems?.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0
  ) || 0;

  const generateExcel = async (data: QuotationFormData) => {
    setIsGenerating(true);
    try {
      const base64 = await generateQuotationExcel(data);
      
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quotation_${data.client_name || "New"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      addToast("تم إنشاء عرض السعر (Excel) بنجاح");
    } catch (error) {
      console.error(error);
      addToast("فشل إنشاء Excel", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async (data: QuotationFormData) => {
    setIsGeneratingPDF(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { QuotationDocument } = await import("@/features/documents/quotation-pdf");

      const blob = await pdf(
        QuotationDocument({
          ...data,
          total,
        })
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Quotation_${data.client_name || "New"}.pdf`;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      link.remove();
      addToast("تم إنشاء عرض السعر (PDF) بنجاح");
    } catch (err) {
      console.error("PDF generation error:", err);
      addToast("فشل إنشاء PDF", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const resetForm = () => {
    setCurrentDocId(null);
    setValue("save_title", "");
    setValue("quotation_date", new Date().toISOString().split("T")[0]);
    setValue("company_name", "شركة مالتي سيستيمز للهندسة والتجارة");
    setValue("client_name", project?.client_name || "");
    setValue("project_name", project?.name || "");
    setValue("location", project?.location || "");
    setValue("notes", "");
    setValue("items", [{ description: "", unit: "م٢", quantity: 0, unit_price: 0 }]);
  };

  const loadQuotation = (doc: any) => {
    setCurrentDocId(doc.id);
    const c = doc.content;
    setValue("save_title", c.save_title || "");
    setValue("quotation_date", c.quotation_date);
    setValue("company_name", c.company_name);
    setValue("client_name", c.client_name);
    setValue("project_name", c.project_name);
    setValue("location", c.location);
    setValue("notes", c.notes);
    setValue("items", c.items || []);
  };

  const saveQuotation = async (data: QuotationFormData) => {
    if (!project) return;
    setIsSaving(true);
    const supabase = createClient();
    try {
      if (currentDocId) {
        await supabase.from("documents").update({ content: data, generated_at: new Date().toISOString() }).eq("id", currentDocId);
        addToast("تم تحديث عرض السعر بنجاح");
      } else {
        const { data: inserted, error } = await supabase.from("documents").insert({
          project_id: project.id,
          doc_type: "quotation",
          content: data,
        }).select().single();
        if (error) throw error;
        setCurrentDocId(inserted.id);
        addToast("تم حفظ عرض السعر بنجاح");
      }
      loadQuotations();
    } catch (e) {
      addToast("حدث خطأ أثناء الحفظ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuotation = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      console.error(error);
      addToast("فشل الحذف", "error");
      return;
    }
    if (currentDocId === id) resetForm();
    loadQuotations();
    addToast("تم الحذف بنجاح");
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Saved Quotations Tabs */}
      <div className="flex flex-wrap gap-2 mb-2 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
        <button
          type="button"
          onClick={resetForm}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${!currentDocId ? "bg-primary-100 text-primary-700 shadow-sm" : "bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200"}`}
        >
          <Plus size={14} />
          إنشاء جديد
        </button>
        {savedQuotations.map((doc, i) => (
          <div key={doc.id} className="flex items-stretch shadow-sm rounded-lg border border-zinc-200 bg-white">
            <button
              type="button"
              onClick={() => loadQuotation(doc)}
              className={`px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors flex flex-col items-start justify-center ${currentDocId === doc.id ? "bg-primary-100 text-primary-700" : "hover:bg-zinc-50 text-zinc-600"}`}
            >
              <span>{doc.content?.save_title || `نسخة ${savedQuotations.length - i}`}</span>
              <span className="text-[10px] font-normal opacity-70 font-mono">
                {new Date(doc.generated_at).toLocaleDateString("en-GB")}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(doc.id);
              }}
              className="bg-white hover:bg-rose-50 text-zinc-400 hover:text-rose-600 px-3 py-2 rounded-l-lg border-r border-zinc-200 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Header Info */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-4">
        <label className="block text-xs font-semibold mb-1.5 text-zinc-700">عنوان الحفظ (اختياري)</label>
        <input {...register("save_title")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="مثال: عرض مبدئي معدل" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">التاريخ</label>
          <input type="date" {...register("quotation_date")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          {errors.quotation_date && <p className="text-xs text-rose-600 mt-1">{errors.quotation_date.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">اسم العميل</label>
          <input {...register("client_name")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="اسم العميل" />
          {errors.client_name && <p className="text-xs text-rose-600 mt-1">{errors.client_name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">اسم المشروع</label>
          <input {...register("project_name")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="المشروع" />
          {errors.project_name && <p className="text-xs text-rose-600 mt-1">{errors.project_name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">الموقع</label>
          <input {...register("location")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="مثال: كمبوند سيليا" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">الشركة المنفذة</label>
          <input {...register("company_name")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          {errors.company_name && <p className="text-xs text-rose-600 mt-1">{errors.company_name.message}</p>}
        </div>
      </div>



      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold">{AR.document.items}</label>
        </div>

        {errors.items && typeof errors.items.message === "string" && (
          <p className="text-xs text-[#DC2626] mb-2">{errors.items.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => {
            const qty = Number(watchedItems?.[index]?.quantity) || 0;
            const price = Number(watchedItems?.[index]?.unit_price) || 0;
            const lineTotal = qty * price;

            return (
              <div key={field.id} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 transition-all focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-zinc-500">البند #{index + 1}</h4>
                  <button
                    type="button"
                    className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">بيان الأعمال وتوصيف المواصفات</label>
                    <textarea
                      {...register(`items.${index}.description`)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[80px]"
                      placeholder="أدخل تفاصيل البند بدقة..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">الكمية</label>
                      <NumberInput
                        step="0.01"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">الوحدة</label>
                      <select
                        {...register(`items.${index}.unit`)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      >
                        <option value="م٢">م٢</option>
                        <option value="م.ط">م.ط</option>
                        <option value="م٣">م٣</option>
                        <option value="مقطوعية">مقطوعية</option>
                        <option value="عدد">عدد</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">فئة السعر (ج.م.)</label>
                      <NumberInput
                        step="0.01"
                        {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {lineTotal > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-500">إجمالي البند:</span>
                    <span className="font-mono text-sm font-bold text-emerald-600">{formatCurrency(lineTotal)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Item Button */}
        <button
          type="button"
          onClick={() => append({ description: "", unit: "م٢", quantity: 0, unit_price: 0 })}
          className="mt-4 w-full border-2 border-dashed border-primary-300 hover:border-primary-500 bg-primary-50/50 hover:bg-primary-50 text-primary-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span>إضافة بند جديد للمقايسة</span>
        </button>
      </div>

      {/* Totals */}
      <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <span className="text-emerald-900 font-bold text-lg">{AR.general.total}</span>
        <span className="font-mono text-2xl font-black text-emerald-600 tracking-tight">{formatCurrency(total)}</span>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold mb-1">{AR.document.notes}</label>
        <textarea {...register("notes")} className="w-full" rows={3} placeholder="ملاحظات إضافية..." />
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={handleSubmit(saveQuotation)}
          className="btn-secondary border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 flex items-center justify-center gap-2 w-full py-3"
          disabled={isSaving}
        >
          <Save size={16} />
          <span>{isSaving ? "جاري الحفظ..." : currentDocId ? "تحديث العرض المحفوظ" : "حفظ العرض في السجل"}</span>
        </button>
        <button
          type="button"
          onClick={handleSubmit(generateExcel)}
          className="btn-primary flex items-center gap-2 w-full justify-center py-3"
          disabled={isGenerating || isGeneratingPDF}
        >
          <FileSpreadsheet size={16} />
          <span>{isGenerating ? "جاري إنشاء ملف Excel..." : "تحميل عرض السعر (Excel)"}</span>
        </button>
        <button
          type="button"
          onClick={handleSubmit(generatePDF)}
          className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 w-full justify-center py-3"
          disabled={isGenerating || isGeneratingPDF}
        >
          <Download size={16} />
          <span>{isGeneratingPDF ? "جاري إنشاء ملف PDF..." : "تحميل عرض السعر (PDF)"}</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteQuotation(deleteTarget);
          setDeleteTarget(null);
        }}
        title="حذف عرض السعر"
        message="هل أنت متأكد من الحذف؟ لا يمكن التراجع."
        confirmLabel="حذف"
        loading={false}
      />
    </div>
  );
}

function PaymentCertForm({ project }: { project: Project | null }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCerts, setSavedCerts] = useState<any[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadCerts = async () => {
    if (!project) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("project_id", project.id)
      .eq("doc_type", "payment_certificate")
      .order("generated_at", { ascending: false });
    if (data) setSavedCerts(data);
  };

  useEffect(() => {
    loadCerts();
  }, [project]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentCertFormData>({
    resolver: zodResolver(paymentCertSchema),
    defaultValues: {
      certificate_no: "1",
      certificate_date: new Date().toISOString().split("T")[0],
      company_name: "شركة مالتي سيستيمز للهندسة والتجارة",
      client_name: "",
      project_name: "",
      location: "",
      notes: "",
      items: [{ 
        description: "مشتريات خارج المقايسة (مرفق كشف مفصل بالفواتير)", 
        unit: "مقطوعية", 
        quantity_contract: 1, 
        quantity_previous: 0, 
        quantity_current: 1, 
        execution_percentage: 100,
        unit_price: 0 
      }],
    },
  });

  useEffect(() => {
    if (project && !currentDocId) {
      setValue("client_name", project.client_name || "");
      setValue("project_name", project.name || "");
      setValue("location", project.location || "");
      
      const totalPurchases = (project as any)?.total_purchases || 0;
      setValue("items.0.unit_price", totalPurchases);
    }
  }, [project, currentDocId, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  // Calculate totals based on percentage and quantities
  const totalWorkValue = watchedItems?.reduce((sum, item) => {
    const perc = Number(item.execution_percentage) || 0;
    const contract = Number(item.quantity_contract) || 0;
    const price = Number(item.unit_price) || 0;
    return sum + (perc / 100) * (contract * price);
  }, 0) || 0;

  const totalPreviousValue = watchedItems?.reduce((sum, item) => {
    return sum + (Number(item.quantity_previous) || 0) * (Number(item.unit_price) || 0);
  }, 0) || 0;

  const totalCurrentValue = totalWorkValue - totalPreviousValue;
  
  const totalReceived = (project as any)?.total_received || 0;
  const netPayable = totalWorkValue - totalReceived;

  const resetForm = () => {
    setCurrentDocId(null);
    setValue("save_title", "");
    setValue("certificate_date", new Date().toISOString().split("T")[0]);

    if (savedCerts && savedCerts.length > 0) {
      // Duplicate latest
      const latest = savedCerts[0].content;
      const nextNo = !isNaN(Number(latest.certificate_no)) ? String(Number(latest.certificate_no) + 1) : latest.certificate_no + " - جديد";
      setValue("certificate_no", nextNo);
      setValue("company_name", latest.company_name);
      setValue("client_name", latest.client_name);
      setValue("project_name", latest.project_name);
      setValue("location", latest.location);
      setValue("notes", latest.notes || "");
      
      const newItems = (latest.items || []).map((item: any, index: number) => {
        // ALWAYS keep index 0 as requested by the user
        if (index === 0) {
          return {
            ...item,
            quantity_contract: 1,
            quantity_previous: 0,
            quantity_current: 1,
            execution_percentage: 100,
            unit_price: (project as any)?.total_purchases || 0
          };
        }

        const prev = Number(item.quantity_previous) || 0;
        const curr = Number(item.quantity_current) || 0;
        const newPrev = prev + curr;
        const contract = Number(item.quantity_contract) || 0;
        
        let newPerc = 0;
        if (contract > 0) {
          newPerc = Number(((newPrev / contract) * 100).toFixed(2));
        }

        return {
          ...item,
          quantity_previous: newPrev,
          quantity_current: 0,
          execution_percentage: newPerc
        };
      });
      
      setValue("items", newItems);
    } else {
      // Clean slate
      setValue("certificate_no", "1");
      setValue("company_name", "شركة مالتي سيستيمز للهندسة والتجارة");
      setValue("client_name", project?.client_name || "");
      setValue("project_name", project?.name || "");
      setValue("location", project?.location || "");
      setValue("notes", "");
      const totalPurchases = (project as any)?.total_purchases || 0;
      setValue("items", [{ 
        description: "مشتريات خارج المقايسة (مرفق كشف مفصل بالفواتير)", 
        unit: "مقطوعية", 
        quantity_contract: 1, 
        quantity_previous: 0, 
        quantity_current: 1, 
        execution_percentage: 100,
        unit_price: totalPurchases 
      }]);
    }
  };

  const loadCert = (doc: any) => {
    setCurrentDocId(doc.id);
    const c = doc.content;
    setValue("save_title", c.save_title || "");
    setValue("certificate_no", c.certificate_no);
    setValue("certificate_date", c.certificate_date);
    setValue("company_name", c.company_name);
    setValue("client_name", c.client_name);
    setValue("project_name", c.project_name);
    setValue("location", c.location);
    setValue("notes", c.notes);
    setValue("items", c.items || []);
  };

  const saveCert = async (data: PaymentCertFormData) => {
    if (!project) return;
    setIsSaving(true);
    const supabase = createClient();
    try {
      if (currentDocId) {
        await supabase.from("documents").update({ content: data, generated_at: new Date().toISOString() }).eq("id", currentDocId);
        addToast("تم تحديث المستخلص بنجاح");
      } else {
        const { data: inserted, error } = await supabase.from("documents").insert({
          project_id: project.id,
          doc_type: "payment_certificate",
          content: data,
        }).select().single();
        if (error) throw error;
        setCurrentDocId(inserted.id);
        addToast("تم حفظ المستخلص بنجاح");
      }
      loadCerts();
    } catch (e) {
      addToast("حدث خطأ أثناء الحفظ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCert = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      console.error(error);
      addToast("فشل الحذف", "error");
      return;
    }
    if (currentDocId === id) resetForm();
    loadCerts();
    addToast("تم الحذف بنجاح");
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const generatePDF = async (data: PaymentCertFormData) => {
    setIsGeneratingPDF(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { PaymentCertDocument } = await import("@/features/documents/payment-certificate-pdf");

      const blob = await pdf(
        PaymentCertDocument({
          ...data,
          totalWorkValue,
          totalReceived,
          netPayable,
        })
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Payment_Certificate_${data.certificate_no}_${data.client_name || "New"}.pdf`;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      link.remove();
      addToast("تم إنشاء المستخلص (PDF) بنجاح");
    } catch (err) {
      console.error("PDF generation error:", err);
      addToast("فشل إنشاء PDF", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Saved Certs Tabs */}
      <div className="flex flex-wrap gap-2 mb-2 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
        <button
          type="button"
          onClick={resetForm}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${!currentDocId ? "bg-primary-100 text-primary-700 shadow-sm" : "bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200"}`}
        >
          <Plus size={14} />
          إنشاء جديد
        </button>
        {savedCerts.map((doc, i) => (
          <div key={doc.id} className="flex items-stretch shadow-sm rounded-lg border border-zinc-200 bg-white">
            <button
              type="button"
              onClick={() => loadCert(doc)}
              className={`px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors flex flex-col items-start justify-center ${currentDocId === doc.id ? "bg-primary-100 text-primary-700" : "hover:bg-zinc-50 text-zinc-600"}`}
            >
              <span>{doc.content?.save_title || `مستخلص رقم ${doc.content?.certificate_no || savedCerts.length - i}`}</span>
              <span className="text-[10px] font-normal opacity-70 font-mono">
                {new Date(doc.generated_at).toLocaleDateString("en-GB")}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(doc.id);
              }}
              className="bg-white hover:bg-rose-50 text-zinc-400 hover:text-rose-600 px-3 py-2 rounded-l-lg border-r border-zinc-200 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-4">
        <label className="block text-xs font-semibold mb-1.5 text-zinc-700">عنوان الحفظ للمستخلص (اختياري)</label>
        <input {...register("save_title")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="مثال: مستخلص رقم 1 - أعمال الخرسانة" />
      </div>

      {/* Header Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">رقم المستخلص</label>
          <input {...register("certificate_no")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono" placeholder="1" />
          {errors.certificate_no && <p className="text-xs text-rose-600 mt-1">{errors.certificate_no.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">التاريخ</label>
          <input type="date" {...register("certificate_date")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          {errors.certificate_date && <p className="text-xs text-rose-600 mt-1">{errors.certificate_date.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">اسم العميل</label>
          <input {...register("client_name")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">المشروع</label>
          <input {...register("project_name")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-zinc-700">الشركة المنفذة</label>
          <input {...register("company_name")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
      </div>

      {/* Items */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold">بنود الأعمال المنفذة</label>
        </div>

        {errors.items && typeof errors.items.message === "string" && (
          <p className="text-xs text-[#DC2626] mb-2">{errors.items.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => {
            const contract = Number(watchedItems?.[index]?.quantity_contract) || 0;
            const prev = Number(watchedItems?.[index]?.quantity_previous) || 0;
            const curr = Number(watchedItems?.[index]?.quantity_current) || 0;
            const perc = Number(watchedItems?.[index]?.execution_percentage) || 0;
            const price = Number(watchedItems?.[index]?.unit_price) || 0;
            const totalQty = prev + curr;
            const itemTotalValue = (perc / 100) * contract * price;
            const prevValue = prev * price;
            const currentVal = itemTotalValue - prevValue;

            return (
              <div key={field.id} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 transition-all focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-zinc-500">البند #{index + 1}</h4>
                  <button
                    type="button"
                    className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                    onClick={() => fields.length > 1 && index !== 0 && remove(index)}
                    disabled={fields.length <= 1 || index === 0}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">بيان الأعمال</label>
                    <textarea
                      {...register(`items.${index}.description`)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[60px]"
                      placeholder="أدخل تفاصيل البند المنفذ..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">الوحدة</label>
                      <select
                        {...register(`items.${index}.unit`)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      >
                        <option value="م٢">م٢</option>
                        <option value="م.ط">م.ط</option>
                        <option value="م٣">م٣</option>
                        <option value="مقطوعية">مقطوعية</option>
                        <option value="عدد">عدد</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-semibold text-zinc-700 mb-1.5 text-center">كمية المقايسة</label>
                      <NumberInput step="0.01" {...register(`items.${index}.quantity_contract`, { 
                        valueAsNumber: true,
                        onChange: (e) => {
                          const val = parseFloat(e.target.value) || 0;
                          if (val > 0) setValue(`items.${index}.execution_percentage`, Number((((prev + curr) / val) * 100).toFixed(2)));
                        }
                      })} className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-2 text-sm text-center font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-semibold text-amber-700 mb-1.5 text-center">كمية سابقة</label>
                      <NumberInput step="0.01" {...register(`items.${index}.quantity_previous`, { 
                        valueAsNumber: true,
                        onChange: (e) => {
                          const val = parseFloat(e.target.value) || 0;
                          if (contract > 0) setValue(`items.${index}.execution_percentage`, Number((((val + curr) / contract) * 100).toFixed(2)));
                        }
                      })} className="w-full bg-amber-50 border border-amber-200 rounded-lg px-2 py-2 text-sm text-center font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-semibold text-emerald-700 mb-1.5 text-center">كمية حالية</label>
                      <NumberInput step="0.01" {...register(`items.${index}.quantity_current`, { 
                        valueAsNumber: true,
                        onChange: (e) => {
                          const val = parseFloat(e.target.value) || 0;
                          if (contract > 0) setValue(`items.${index}.execution_percentage`, Number((((prev + val) / contract) * 100).toFixed(2)));
                        }
                      })} className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-2 text-sm text-center font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-semibold text-zinc-700 mb-1.5 text-center">إجمالي الكمية</label>
                      <div className="w-full bg-zinc-100 border border-zinc-200 rounded-lg px-2 py-2 text-sm text-center font-mono font-bold text-zinc-600">{totalQty}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-semibold text-blue-700 mb-1.5 text-center">نسبة التنفيذ %</label>
                      <NumberInput step="0.01" {...register(`items.${index}.execution_percentage`, { valueAsNumber: true })} className="w-full bg-blue-50 border border-blue-200 rounded-lg px-2 py-2 text-sm text-center font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-semibold text-zinc-700 mb-1.5 text-center">الفئة (السعر)</label>
                      <NumberInput step="0.01" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-2 text-sm text-center font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-semibold text-purple-700 mb-1.5 text-center">الإجمالي بالجنيه</label>
                      <div className="w-full bg-purple-50 border border-purple-200 rounded-lg px-2 py-2 text-sm text-center font-mono font-bold text-purple-700">{formatCurrency(itemTotalValue)}</div>
                    </div>
                  </div>
                </div>

                {currentVal > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-500">قيمة الأعمال الحالية للبند:</span>
                    <span className="font-mono text-sm font-bold text-emerald-600">{formatCurrency(currentVal)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Item Button */}
        <button
          type="button"
          onClick={() => append({ description: "", unit: "م٢", quantity_contract: 0, quantity_previous: 0, quantity_current: 0, execution_percentage: 0, unit_price: 0 })}
          className="mt-4 w-full border-2 border-dashed border-primary-300 hover:border-primary-500 bg-primary-50/50 hover:bg-primary-50 text-primary-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span>إضافة بند جديد للمستخلص</span>
        </button>
      </div>

      {/* Financial Summary */}
      <div className="mt-6 border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-zinc-100 px-5 py-3 border-b border-zinc-200">
          <h3 className="font-bold text-sm text-zinc-800">الخلاصة المالية (Financial Summary)</h3>
        </div>
        <div className="p-5 bg-white space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-zinc-100">
            <span className="text-sm font-semibold text-zinc-600">إجمالي الأعمال حتى تاريخه (Total Work Value)</span>
            <span className="font-mono text-lg font-bold">{formatCurrency(totalWorkValue)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-zinc-100">
            <span className="text-sm font-semibold text-zinc-500">يخصم: إجمالي الدفعات المستلمة للآن (Total Received Payments)</span>
            <span className="font-mono text-sm text-rose-600">-{formatCurrency(totalReceived)}</span>
          </div>

          <div className="flex justify-between items-center pt-4 mt-2">
            <span className="text-emerald-900 font-bold text-lg">الصافي المستحق صرفه (Net Payable)</span>
            <span className="font-mono text-2xl font-black text-emerald-600 tracking-tight">{formatCurrency(netPayable)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold mb-1">ملاحظات / خصومات أخرى</label>
        <textarea {...register("notes")} className="w-full" rows={3} placeholder="أي ملاحظات أو خصومات إضافية..." />
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={handleSubmit(saveCert)}
          className="btn-secondary border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 flex items-center justify-center gap-2 w-full py-3"
          disabled={isSaving}
        >
          <Save size={16} />
          <span>{isSaving ? "جاري الحفظ..." : currentDocId ? "تحديث المستخلص المحفوظ" : "حفظ المستخلص في السجل"}</span>
        </button>
        <button
          type="button"
          onClick={handleSubmit(generatePDF)}
          className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 w-full justify-center py-3"
          disabled={isGeneratingPDF}
        >
          <Download size={16} />
          <span>{isGeneratingPDF ? "جاري إنشاء ملف PDF..." : "تحميل المستخلص (PDF)"}</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteCert(deleteTarget);
          setDeleteTarget(null);
        }}
        title="حذف المستخلص"
        message="هل أنت متأكد من الحذف؟ لا يمكن التراجع."
        confirmLabel="حذف"
        loading={false}
      />
    </div>
  );
}
