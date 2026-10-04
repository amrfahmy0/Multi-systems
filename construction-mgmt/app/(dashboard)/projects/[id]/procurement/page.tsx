"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowRight, Image as ImageIcon, Camera } from "lucide-react";
import { AR, PROCUREMENT_CATEGORIES } from "@/config/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useProcurement } from "@/lib/hooks/use-procurement";
import type { ProcurementItem } from "@/lib/types";
import { Modal, ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { procurementSchema, type ProcurementFormData } from "@/lib/validations";
import { compressAndUploadImage } from "@/lib/upload";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button
} from "@nextui-org/react";

export default function ProcurementPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { loading: mutationLoading, fetchItems, addItem, deleteItem } = useProcurement(projectId);
  const { addToast } = useToast();

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch {
      addToast(AR.general.error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = items.reduce((s, i) => s + Number(i.total_price), 0);

  const categoryLabel = (value: string) => {
    const cat = PROCUREMENT_CATEGORIES.find((c) => c.value === value);
    return cat ? cat.label : value;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget);
      setDeleteTarget(null);
      loadItems();
    } catch { /* handled by hook */ }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted mb-4 font-mono">
        <Link href="/" className="hover:text-foreground">{AR.nav.dashboard}</Link>
        <ArrowRight size={12} className="rtl:rotate-180" />
        <Link href={`/projects/${projectId}`} className="hover:text-foreground">{AR.project.title}</Link>
        <ArrowRight size={12} className="rtl:rotate-180" />
        <span className="text-foreground">{AR.procurement.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">{AR.procurement.title}</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">
            {items.length} صنف · {AR.general.total}: {formatCurrency(total)}
          </p>
        </div>
        <Button 
          color="warning" 
          variant="shadow" 
          startContent={<Plus size={16} />} 
          onClick={() => setShowAddModal(true)}
          className="text-white font-semibold shadow-md rounded-2xl shrink-0"
        >
          <span className="hidden sm:inline">{AR.procurement.addItem}</span>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-zinc-200 animate-pulse rounded-2xl w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state py-12 flex flex-col items-center justify-center text-zinc-400">
          <Camera size={48} className="mb-4 opacity-50" />
          <p className="font-semibold text-lg text-zinc-600">{AR.procurement.noItems}</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full pb-6">
          <Table aria-label="Procurement table" shadow="sm" className="min-w-[700px]">
            <TableHeader>
              <TableColumn>{AR.procurement.itemName}</TableColumn>
              <TableColumn>{AR.procurement.category}</TableColumn>
              <TableColumn>{AR.procurement.quantity}</TableColumn>
              <TableColumn>{AR.procurement.unitPrice}</TableColumn>
              <TableColumn>{AR.procurement.totalPrice}</TableColumn>
              <TableColumn align="center">{AR.procurement.invoiceImage}</TableColumn>
              <TableColumn align="center">{AR.general.actions}</TableColumn>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-zinc-900">{item.item_name}</TableCell>
                  <TableCell className="text-sm">{categoryLabel(item.category)}</TableCell>
                  <TableCell className="font-mono text-sm">{item.quantity}</TableCell>
                  <TableCell className="font-mono text-sm">{formatCurrency(Number(item.unit_price))}</TableCell>
                  <TableCell className="font-mono font-bold text-sm">{formatCurrency(Number(item.total_price))}</TableCell>
                  <TableCell>
                    {item.invoice_url ? (
                      <Button as="a" href={item.invoice_url} target="_blank" rel="noopener noreferrer" isIconOnly color="primary" variant="flat" size="sm">
                        <ImageIcon size={14} />
                      </Button>
                    ) : (
                      <span className="text-zinc-400 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button isIconOnly color="danger" variant="light" size="sm" onClick={() => setDeleteTarget(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 flex justify-between items-center bg-zinc-100/80 p-4 rounded-2xl border border-zinc-200/50">
            <span className="font-bold font-heading text-lg text-zinc-900">{AR.general.total}</span>
            <span className="font-mono font-bold text-xl text-emerald-700">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddProcurementModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data, invoiceUrl) => {
            await addItem(data, invoiceUrl);
            setShowAddModal(false);
            loadItems();
          }}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={AR.general.delete}
        message="هل أنت متأكد من حذف هذا الصنف؟"
        confirmLabel={AR.general.delete}
        loading={mutationLoading}
      />
    </div>
  );
}

// ─── Add Procurement Modal ─────────────────────────────────────────
function AddProcurementModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: ProcurementFormData, invoiceUrl: string) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProcurementFormData>({
    resolver: zodResolver(procurementSchema),
  });

  const quantity = watch("quantity") || 0;
  const unitPrice = watch("unit_price") || 0;
  const calculatedTotal = Number(quantity) * Number(unitPrice);

  const onFormSubmit = async (data: ProcurementFormData) => {
    if (!invoiceFile) {
      setInvoiceError(AR.procurement.invoiceRequired);
      return;
    }
    setInvoiceError("");
    setSubmitting(true);
    try {
      setUploadProgress("جاري رفع الفاتورة...");
      const invoiceUrl = await compressAndUploadImage(invoiceFile);
      setUploadProgress("");
      await onSubmit(data, invoiceUrl);
    } catch {
      addToast(AR.general.error, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={AR.procurement.addItem}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>{AR.general.cancel}</button>
          <button className="btn-primary" onClick={handleSubmit(onFormSubmit)} disabled={submitting}>
            {submitting ? uploadProgress || "..." : AR.general.save}
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
        <div>
          <label className="block text-xs font-semibold mb-1">{AR.procurement.itemName}</label>
          <input {...register("item_name")} className="w-full" placeholder="مثال: أسلاك كهرباء 2.5مم" />
          {errors.item_name && <p className="text-xs text-[#DC2626] mt-1">{errors.item_name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">{AR.procurement.category}</label>
          <select {...register("category")} className="w-full">
            <option value="">اختر الفئة</option>
            {PROCUREMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-[#DC2626] mt-1">{errors.category.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">{AR.procurement.quantity}</label>
            <input type="number" step="0.01" {...register("quantity", { valueAsNumber: true })} className="w-full" />
            {errors.quantity && <p className="text-xs text-[#DC2626] mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">{AR.procurement.unitPrice}</label>
            <input type="number" step="0.01" {...register("unit_price", { valueAsNumber: true })} className="w-full" />
            {errors.unit_price && <p className="text-xs text-[#DC2626] mt-1">{errors.unit_price.message}</p>}
          </div>
        </div>

        {/* Calculated Total */}
        {calculatedTotal > 0 && (
          <div className="bg-[#F5F5F5] border border-black p-3 flex justify-between items-center">
            <span className="text-xs font-semibold">{AR.procurement.totalPrice}</span>
            <span className="font-mono font-bold">{formatCurrency(calculatedTotal)}</span>
          </div>
        )}

        {/* Invoice Upload - REQUIRED */}
        <div>
          <label className="block text-xs font-semibold mb-1">
            {AR.procurement.invoiceImage} <span className="text-[#DC2626]">*</span>
          </label>
          <div className="border border-dashed border-black p-4 text-center">
            <Camera size={24} className="mx-auto mb-2 text-muted" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                setInvoiceFile(e.target.files?.[0] || null);
                setInvoiceError("");
              }}
              className="w-full text-xs"
            />
          </div>
          {invoiceFile && (
            <p className="text-xs text-muted mt-1 font-mono">
              {invoiceFile.name} ({(invoiceFile.size / 1024).toFixed(0)}KB)
            </p>
          )}
          {invoiceError && <p className="text-xs text-[#DC2626] mt-1">{invoiceError}</p>}
        </div>
      </form>
    </Modal>
  );
}
