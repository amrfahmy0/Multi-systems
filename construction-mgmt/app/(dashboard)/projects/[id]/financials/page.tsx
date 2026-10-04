"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Pencil, ArrowRight, Receipt, Wallet, Banknote, Image as ImageIcon, TrendingDown, ShoppingCart, Camera, X, Eye, EyeOff, UserCog, CheckCircle, ChevronRight, ChevronDown, DollarSign, Home, ChevronLeft } from "lucide-react";
import { AR, EXPENSE_CATEGORIES, PROCUREMENT_CATEGORIES } from "@/config/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useFinancials } from "@/lib/hooks/use-financials";
import { useProcurement } from "@/lib/hooks/use-procurement";
import type { ClientPayment, GeneralExpense, ProcurementItem, SupervisorLog } from "@/lib/types";
import { Modal, ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientPaymentSchema,
  generalExpenseSchema,
  procurementSchema,
  supervisorLogSchema,
  type ClientPaymentFormData,
  type GeneralExpenseFormData,
  type ProcurementFormData,
  type SupervisorLogFormData,
} from "@/lib/validations";
import { compressAndUploadImage } from "@/lib/upload";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Button,
  Chip
} from "@nextui-org/react";

type Tab = "payments" | "expenses" | "procurement" | "supervisor";

export default function FinancialsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("payments");
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [expenses, setExpenses] = useState<GeneralExpense[]>([]);
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([]);
  const [supervisorLogs, setSupervisorLogs] = useState<SupervisorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: Tab } | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; type: Tab; data: any } | null>(null);

  const {
    loading: mutationLoading,
    fetchPayments,
    addPayment,
    updatePayment,
    deletePayment,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchSupervisorLogs,
    addSupervisorLog,
    updateSupervisorLog,
    deleteSupervisorLog,
    toggleSupervisorPaid,
  } = useFinancials(projectId);
  const { fetchItems: fetchProcurement, addItem: addProcurement, updateItem: updateProcurement, deleteItem: deleteProcurement } = useProcurement(projectId);
  const { addToast } = useToast();

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [p, e, proc, sup] = await Promise.all([fetchPayments(), fetchExpenses(), fetchProcurement(), fetchSupervisorLogs()]);
      setPayments(p);
      setExpenses(e);
      setProcurementItems(proc);
      setSupervisorLogs(sup);
    } catch {
      addToast(AR.general.error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPayments = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalProcurement = procurementItems.reduce((s, i) => s + Number(i.total_price), 0);
  
  // New Business Logic: Net is Payments minus Total Spend (which includes Procurement)
  const pureExpenses = totalExpenses - totalProcurement;
  const netAmount = totalPayments - totalExpenses;

  const tabs = [
    { key: "payments" as Tab, label: AR.financial.clientPayments, icon: Receipt, count: payments.length },
    { key: "expenses" as Tab, label: AR.financial.generalExpenses, icon: Banknote, count: expenses.length },
    { key: "procurement" as Tab, label: AR.nav.procurement, icon: ShoppingCart, count: procurementItems.length },
    { key: "supervisor" as Tab, label: "يوميات المشرف", icon: UserCog, count: supervisorLogs.length },
  ];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "payments") await deletePayment(deleteTarget.id);
      else if (deleteTarget.type === "expenses") await deleteExpense(deleteTarget.id);
      else if (deleteTarget.type === "procurement") await deleteProcurement(deleteTarget.id);
      else await deleteSupervisorLog(deleteTarget.id);
      setDeleteTarget(null);
      loadAll();
    } catch { /* handled by hook */ }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold bg-white/70 backdrop-blur-md border border-zinc-200/50 shadow-sm px-4 py-2.5 rounded-2xl w-fit mb-2 max-w-full">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-primary-600 transition-colors">
          <Home size={16} />
          <span>{AR.nav.dashboard}</span>
        </Link>
        <ChevronLeft size={16} className="text-zinc-300 rtl:rotate-180" />
        <Link href={`/projects/${projectId}`} className="text-zinc-500 hover:text-primary-600 transition-colors">
          {AR.project.title}
        </Link>
        <ChevronLeft size={16} className="text-zinc-300 rtl:rotate-180" />
        <div className="flex items-center gap-2 text-primary-700 bg-primary-50 px-3 py-1 rounded-lg">
          <span>{AR.financial.title}</span>
        </div>
      </div>

      {/* Premium Header with Stats */}
      <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white shadow-xl mb-8">
        {/* Header Top Section */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/20 text-primary-300 flex items-center justify-center shrink-0 border border-primary-500/30">
              <Wallet size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-black tracking-tight text-white">{AR.financial.title}</h1>
              <p className="text-zinc-400 text-sm mt-1">نظرة شاملة على جميع الحركات المالية، المستخلصات والمشتريات</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSensitive(!showSensitive)} 
              className="flex items-center justify-center w-12 h-12 text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              title={showSensitive ? "إخفاء المبالغ" : "إظهار المبالغ"}
            >
              {showSensitive ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <Button 
              size="md"
              color="primary" 
              variant="shadow" 
              startContent={<Plus size={18} />} 
              onPress={() => { setEditTarget(null); setShowAddModal(true); }}
              className="font-bold shadow-primary-500/30 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 px-6 transition-all h-12"
            >
              {activeTab === "payments" ? AR.financial.addPayment : 
               activeTab === "expenses" ? AR.financial.addExpense : 
               activeTab === "procurement" ? AR.procurement.addItem : 
               "إضافة يومية"}
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col gap-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-emerald-400">
              <Receipt size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">{AR.financial.clientPayments}</span>
            </div>
            <span className="text-2xl font-bold font-mono tracking-tight" title={showSensitive ? formatCurrency(totalPayments) : "******"}>
              {showSensitive ? formatCurrency(totalPayments) : "******"}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col gap-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-primary-400">
              <ShoppingCart size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">{AR.nav.procurement}</span>
            </div>
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100" title={formatCurrency(totalProcurement)}>
              {formatCurrency(totalProcurement)}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col gap-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-rose-400">
              <TrendingDown size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">مصروفات التشغيل</span>
            </div>
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100" title={formatCurrency(pureExpenses)}>
              {formatCurrency(pureExpenses)}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col gap-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-amber-400">
              <Banknote size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">إجمالي المنصرف</span>
            </div>
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100" title={formatCurrency(totalExpenses)}>
              {formatCurrency(totalExpenses)}
            </span>
          </div>

          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700 p-5 flex flex-col gap-2 shadow-inner relative overflow-hidden">
            <div className="flex items-center gap-2 text-zinc-300 relative z-10">
              <Wallet size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">الصافي</span>
            </div>
            <span className={`text-2xl font-bold font-mono tracking-tight relative z-10 ${netAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} title={showSensitive ? formatCurrency(netAmount) : "******"}>
              {showSensitive ? formatCurrency(netAmount) : "******"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 mb-6 overflow-x-auto bg-zinc-100/80 rounded-2xl border border-zinc-200/60 w-max max-w-full shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white text-primary-600 shadow-sm border border-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 border border-transparent"
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-primary-50 text-primary-600' : 'bg-zinc-200/80 text-zinc-500'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeTab === "payments" && (
            <PaymentsTable payments={payments} onEdit={(data) => { setEditTarget({ id: data.id, type: "payments", data }); setShowAddModal(true); }} onDelete={(id) => setDeleteTarget({ id, type: "payments" })} showSensitive={showSensitive} />
          )}
          {activeTab === "expenses" && (
            <ExpensesTable expenses={expenses} onEdit={(data) => { setEditTarget({ id: data.id, type: "expenses", data }); setShowAddModal(true); }} onDelete={(id) => setDeleteTarget({ id, type: "expenses" })} />
          )}
          {activeTab === "procurement" && (
            <ProcurementTable items={procurementItems} onEdit={(data) => { setEditTarget({ id: data.id, type: "procurement", data }); setShowAddModal(true); }} onDelete={(id) => setDeleteTarget({ id, type: "procurement" })} />
          )}
          {activeTab === "supervisor" && (
            <SupervisorTable 
              logs={supervisorLogs} 
              onEdit={(data) => { setEditTarget({ id: data.id, type: "supervisor", data }); setShowAddModal(true); }}
              onDelete={(id) => setDeleteTarget({ id, type: "supervisor" })} 
              onTogglePaid={async (log, status) => {
                await toggleSupervisorPaid(log, status);
                loadAll();
              }}
            />
          )}

          <div className="flex justify-center mt-2">
            <Button 
              size="md"
              color="primary" 
              variant="flat" 
              startContent={<Plus size={18} />} 
              onPress={() => { setEditTarget(null); setShowAddModal(true); }}
              className="font-bold rounded-xl w-full sm:w-auto px-8 py-6 border-2 border-dashed border-primary-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-primary-600 bg-white"
            >
              {activeTab === "payments" ? AR.financial.addPayment : 
               activeTab === "expenses" ? AR.financial.addExpense : 
               activeTab === "procurement" ? AR.procurement.addItem : 
               "إضافة يومية"}
            </Button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && activeTab === "payments" && (
        <AddPaymentModal
          onClose={() => setShowAddModal(false)}
          initialData={editTarget?.data}
          onSubmit={async (data) => {
            if (editTarget) await updatePayment(editTarget.id, data);
            else await addPayment(data);
            setShowAddModal(false);
            loadAll();
          }}
        />
      )}
      {showAddModal && activeTab === "expenses" && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          initialData={editTarget?.data}
          onSubmit={async (data) => {
            if (editTarget) await updateExpense(editTarget.id, data);
            else await addExpense(data);
            setShowAddModal(false);
            loadAll();
          }}
        />
      )}
      {showAddModal && activeTab === "procurement" && (
        <AddProcurementModal
          onClose={() => setShowAddModal(false)}
          initialData={editTarget?.data}
          onSubmit={async (data, invoiceUrl) => {
            if (editTarget) await updateProcurement(editTarget.id, data, invoiceUrl);
            else await addProcurement(data, invoiceUrl);
            setShowAddModal(false);
            loadAll();
          }}
        />
      )}
      {showAddModal && activeTab === "supervisor" && (
        <AddSupervisorModal
          onClose={() => setShowAddModal(false)}
          initialData={editTarget?.data}
          onSubmit={async (data) => {
            if (editTarget) await updateSupervisorLog(editTarget.id, data);
            else await addSupervisorLog(data);
            setShowAddModal(false);
            loadAll();
          }}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={AR.general.delete}
        message="هل أنت متأكد من الحذف؟ لا يمكن التراجع."
        confirmLabel={AR.general.delete}
        loading={mutationLoading}
      />
    </div>
  );
}

// ─── Payments Table ────────────────────────────────────────────────
function PaymentsTable({ payments, onEdit, onDelete, showSensitive }: { payments: ClientPayment[]; onEdit: (item: ClientPayment) => void; onDelete: (id: string) => void; showSensitive: boolean }) {
  if (payments.length === 0) {
    return <div className="text-center py-12 text-zinc-400"><p>{AR.general.noData}</p></div>;
  }

  return (
    <div className="overflow-x-auto w-full pb-4">
      <Table aria-label="Payments table" shadow="sm" className="min-w-[600px]">
        <TableHeader>
          <TableColumn>{AR.financial.amount}</TableColumn>
          <TableColumn>{AR.financial.date}</TableColumn>
          <TableColumn>{AR.financial.receiptRef}</TableColumn>
          <TableColumn align="center">{AR.general.actions}</TableColumn>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono font-bold text-emerald-700 text-sm">
                {showSensitive ? formatCurrency(Number(p.amount)) : "******"}
              </TableCell>
              <TableCell className="font-mono text-sm">{formatDate(p.payment_date)}</TableCell>
              <TableCell className="font-mono text-zinc-500 text-sm">{p.receipt_ref || "—"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button isIconOnly color="default" variant="light" size="sm" onClick={() => onEdit(p)}>
                    <Pencil size={16} className="text-zinc-500" />
                  </Button>
                  <Button isIconOnly color="danger" variant="light" size="sm" onClick={() => onDelete(p.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Expenses Table ────────────────────────────────────────────────
function ExpensesTable({ expenses, onEdit, onDelete }: { expenses: GeneralExpense[]; onEdit: (item: GeneralExpense) => void; onDelete: (id: string) => void }) {
  const [supervisorExpanded, setSupervisorExpanded] = useState(false);
  const [procurementExpanded, setProcurementExpanded] = useState(false);

  if (expenses.length === 0) {
    return <div className="text-center py-12 text-zinc-400"><p>{AR.general.noData}</p></div>;
  }

  const categoryLabel = (value: string) => {
    const expCat = EXPENSE_CATEGORIES.find((c) => c.value === value);
    if (expCat) return expCat.label;
    const procCat = PROCUREMENT_CATEGORIES.find((c) => c.value === value);
    return procCat ? procCat.label : value;
  };

  const isSupervisor = (e: GeneralExpense) => e.category === "supervisor_wage" || e.category === "يوميات المشرف" || e.description?.startsWith("يومية إشراف:");
  const isProcurement = (e: GeneralExpense) => e.description?.startsWith("مشتريات:");

  const supervisorExpenses = expenses.filter(isSupervisor);
  const procurementExpenses = expenses.filter(isProcurement);
  const normalExpenses = expenses.filter(e => !isSupervisor(e) && !isProcurement(e));

  const supervisorTotal = supervisorExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const procurementTotal = procurementExpenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <div className="hidden md:block overflow-x-auto w-full pb-4">
      <Table aria-label="Expenses table" shadow="sm" className="min-w-[600px]">
        <TableHeader>
          <TableColumn>{AR.financial.description}</TableColumn>
          <TableColumn>{AR.financial.category}</TableColumn>
          <TableColumn>{AR.financial.amount}</TableColumn>
          <TableColumn>{AR.financial.date}</TableColumn>
          <TableColumn align="center">{AR.general.actions}</TableColumn>
        </TableHeader>
        <TableBody>
          {( [
          ...normalExpenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 max-w-[200px] truncate text-sm">{e.description || "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">{categoryLabel(e.category)}</TableCell>
                <TableCell className="font-mono font-bold text-rose-600 text-sm">{formatCurrency(Number(e.amount))}</TableCell>
                <TableCell className="font-mono text-sm">{formatDate(e.expense_date)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button isIconOnly color="default" variant="light" size="sm" onPress={() => onEdit(e)}>
                      <Pencil size={16} className="text-zinc-500" />
                    </Button>
                    <Button isIconOnly color="danger" variant="light" size="sm" onPress={() => onDelete(e.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )),

          ...(procurementExpenses.length > 0 ? [
            <TableRow key="procurement-group" className="bg-primary-50/50 hover:bg-primary-50/70 cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-2 font-bold text-primary-700 select-none" onClick={() => setProcurementExpanded(!procurementExpanded)}>
                  {procurementExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <ShoppingCart size={16} />
                  <span>إجمالي المشتريات ({procurementExpenses.length} عناصر)</span>
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium">{categoryLabel("مشتريات")}</TableCell>
              <TableCell className="font-mono font-bold text-rose-600 text-sm">{formatCurrency(procurementTotal)}</TableCell>
              <TableCell>—</TableCell>
              <TableCell>—</TableCell>
            </TableRow>
          ] : []),

          ...(procurementExpanded ? procurementExpenses.map((e) => (
            <TableRow key={e.id} className="bg-primary-50/10">
              <TableCell>
                <div className="flex items-center gap-2 pl-6">
                  <ShoppingCart size={14} className="text-primary-500/70 shrink-0" />
                  <span className="text-zinc-500 max-w-[200px] truncate text-sm">{e.description || "—"}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium text-zinc-400">{categoryLabel(e.category)}</TableCell>
              <TableCell className="font-mono font-bold text-rose-600/70 text-sm">{formatCurrency(Number(e.amount))}</TableCell>
              <TableCell className="font-mono text-sm text-zinc-400">{formatDate(e.expense_date)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button isIconOnly color="default" variant="light" size="sm" onPress={() => onEdit(e)}>
                    <Pencil size={16} className="text-zinc-500" />
                  </Button>
                  <Button isIconOnly color="danger" variant="light" size="sm" onPress={() => onDelete(e.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : []),

          ...(supervisorExpenses.length > 0 ? [
            <TableRow key="supervisor-group" className="bg-primary-50/50 hover:bg-primary-50/70 cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-2 font-bold text-primary-700 select-none" onClick={() => setSupervisorExpanded(!supervisorExpanded)}>
                  {supervisorExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <UserCog size={16} />
                  <span>إجمالي يوميات المشرف ({supervisorExpenses.length} أيام)</span>
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium">{categoryLabel("يوميات المشرف")}</TableCell>
              <TableCell className="font-mono font-bold text-rose-600 text-sm">{formatCurrency(supervisorTotal)}</TableCell>
              <TableCell>—</TableCell>
              <TableCell>—</TableCell>
            </TableRow>
          ] : []),

          ...(supervisorExpanded ? supervisorExpenses.map((e) => (
            <TableRow key={e.id} className="bg-primary-50/10">
              <TableCell>
                <div className="flex items-center gap-2 pl-6">
                  <UserCog size={14} className="text-primary-500/70 shrink-0" />
                  <span className="text-zinc-500 max-w-[200px] truncate text-sm">{e.description || "—"}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium text-zinc-400">{categoryLabel(e.category)}</TableCell>
              <TableCell className="font-mono font-bold text-rose-600/70 text-sm">{formatCurrency(Number(e.amount))}</TableCell>
              <TableCell className="font-mono text-sm text-zinc-400">{formatDate(e.expense_date)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button isIconOnly color="default" variant="light" size="sm" onPress={() => onEdit(e)}>
                    <Pencil size={16} className="text-zinc-500" />
                  </Button>
                  <Button isIconOnly color="danger" variant="light" size="sm" onPress={() => onDelete(e.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : [])
          ] as any )}
        </TableBody>
      </Table>
      </div>

      <div className="flex md:hidden flex-col gap-4 w-full pb-4">
        {normalExpenses.map(e => (
          <div key={e.id} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100 text-zinc-500">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-800 line-clamp-2">{e.description || "—"}</h3>
                  <span className="text-xs font-semibold text-zinc-500 mt-0.5 block">{categoryLabel(e.category)}</span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-sm font-bold font-mono text-rose-600 block">{formatCurrency(Number(e.amount))}</span>
                <span className="text-[10px] font-semibold text-zinc-400 block mt-0.5">{formatDate(e.expense_date)}</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3 mt-1">
              <Button size="sm" variant="flat" color="default" className="font-semibold text-xs h-8 px-4" onPress={() => onEdit(e)}>
                تعديل
              </Button>
              <Button size="sm" variant="flat" color="danger" className="font-semibold text-xs h-8 px-4" onPress={() => onDelete(e.id)}>
                حذف
              </Button>
            </div>
          </div>
        ))}

        {procurementExpenses.length > 0 && (
          <div className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100/50 shadow-sm flex flex-col">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setProcurementExpanded(!procurementExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-800">إجمالي المشتريات</h3>
                  <span className="text-xs font-semibold text-primary-600 mt-0.5 block">{procurementExpenses.length} عناصر</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono text-rose-600">{formatCurrency(procurementTotal)}</span>
                <div className="text-primary-400">
                  {procurementExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>
            </div>
            
            {procurementExpanded && (
              <div className="mt-4 pt-4 border-t border-primary-100/50 flex flex-col gap-3">
                {procurementExpenses.map(e => (
                  <div key={e.id} className="bg-white rounded-xl p-3 border border-zinc-100 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800">{e.description || "—"}</h4>
                        <span className="text-[10px] text-zinc-400">{formatDate(e.expense_date)}</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-rose-600">{formatCurrency(Number(e.amount))}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button isIconOnly size="sm" variant="light" color="default" onPress={() => onEdit(e)}><Pencil size={14} /></Button>
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDelete(e.id)}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {supervisorExpenses.length > 0 && (
          <div className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100/50 shadow-sm flex flex-col">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setSupervisorExpanded(!supervisorExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <UserCog size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-800">إجمالي يوميات المشرف</h3>
                  <span className="text-xs font-semibold text-primary-600 mt-0.5 block">{supervisorExpenses.length} أيام</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono text-rose-600">{formatCurrency(supervisorTotal)}</span>
                <div className="text-primary-400">
                  {supervisorExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>
            </div>
            
            {supervisorExpanded && (
              <div className="mt-4 pt-4 border-t border-primary-100/50 flex flex-col gap-3">
                {supervisorExpenses.map(e => (
                  <div key={e.id} className="bg-white rounded-xl p-3 border border-zinc-100 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800">{e.description || "—"}</h4>
                        <span className="text-[10px] text-zinc-400">{formatDate(e.expense_date)}</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-rose-600">{formatCurrency(Number(e.amount))}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button isIconOnly size="sm" variant="light" color="default" onPress={() => onEdit(e)}><Pencil size={14} /></Button>
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDelete(e.id)}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}


// ─── Add Payment Modal ─────────────────────────────────────────────
function AddPaymentModal({ onClose, onSubmit, initialData }: { onClose: () => void; onSubmit: (data: ClientPaymentFormData) => Promise<void>; initialData?: any }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ClientPaymentFormData>({
    resolver: zodResolver(clientPaymentSchema),
    defaultValues: initialData || { payment_date: new Date().toISOString().split("T")[0] },
  });

  const onFormSubmit = async (data: ClientPaymentFormData) => {
    setSubmitting(true);
    try { 
      await onSubmit(data); 
    } catch (e) {
      console.error("Payment submission error:", e);
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={AR.financial.addPayment} footer={
      <>
        <Button color="default" variant="light" onPress={onClose} isDisabled={submitting}>{AR.general.cancel}</Button>
        <Button color="primary" onPress={() => { handleSubmit(onFormSubmit)(); }} isLoading={submitting}>{AR.general.save}</Button>
      </>
    }>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onFormSubmit)}>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.financial.amount}</label>
          <input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.financial.date}</label>
          <input type="date" {...register("payment_date")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.financial.receiptRef}</label>
          <input {...register("receipt_ref")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="REC-001" />
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Expense Modal ─────────────────────────────────────────────
function AddExpenseModal({ onClose, onSubmit, initialData }: { onClose: () => void; onSubmit: (data: GeneralExpenseFormData) => Promise<void>; initialData?: any }) {
  const [submitting, setSubmitting] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  useEffect(() => {
    import("@/config/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.from("general_expenses").select("category").then(({ data }: any) => {
        if (data) setCustomCategories(Array.from(new Set(data.map((d: any) => d.category))));
      });
    });
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<GeneralExpenseFormData>({
    resolver: zodResolver(generalExpenseSchema),
    defaultValues: initialData || { expense_date: new Date().toISOString().split("T")[0] },
  });

  const onFormSubmit = async (data: GeneralExpenseFormData) => {
    setSubmitting(true);
    try { 
      await onSubmit(data); 
    } catch (e) {
      console.error("Expense submission error:", e);
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={AR.financial.addExpense} footer={
      <>
        <Button color="default" variant="light" onPress={onClose} isDisabled={submitting}>{AR.general.cancel}</Button>
        <Button color="primary" onPress={() => { handleSubmit(onFormSubmit)(); }} isLoading={submitting}>{AR.general.save}</Button>
      </>
    }>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onFormSubmit)}>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.financial.amount}</label>
          <input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.financial.category}</label>
          <input 
            list="expense-categories"
            {...register("category")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
            placeholder="اختر أو اكتب فئة جديدة..."
            autoComplete="off"
          />
          <datalist id="expense-categories">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
            {customCategories.filter(c => !EXPENSE_CATEGORIES.find(ec => ec.value === c)).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.category && <p className="text-xs text-rose-600 mt-1">{errors.category.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.financial.description}</label>
          <textarea {...register("description")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" rows={2} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.financial.date}</label>
          <input type="date" {...register("expense_date")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
      </form>
    </Modal>
  );
}

// ─── Procurement Table ─────────────────────────────────────────────
function ProcurementTable({ items, onEdit, onDelete }: { items: ProcurementItem[]; onEdit: (item: ProcurementItem) => void; onDelete: (id: string) => void }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (items.length === 0) {
    return <div className="text-center py-12 text-zinc-400"><p>{AR.general.noData}</p></div>;
  }

  const categoryLabel = (value: string) => {
    const cat = PROCUREMENT_CATEGORIES.find((c) => c.value === value);
    return cat ? cat.label : value;
  };

  return (
    <>
    <div className="overflow-x-auto w-full pb-4">
      <Table aria-label="Procurement table" shadow="sm" className="min-w-[700px]">
        <TableHeader>
          <TableColumn>{AR.procurement.itemName}</TableColumn>
          <TableColumn>{AR.procurement.category}</TableColumn>
          <TableColumn>{AR.financial.date}</TableColumn>
          <TableColumn>{AR.procurement.quantity}</TableColumn>
          <TableColumn>{AR.procurement.unitPrice}</TableColumn>
          <TableColumn>{AR.procurement.totalPrice}</TableColumn>
          <TableColumn align="center">{AR.procurement.invoiceImage}</TableColumn>
          <TableColumn align="center">{AR.general.actions}</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-zinc-900 text-sm">{item.item_name}</TableCell>
              <TableCell className="text-sm font-medium">{categoryLabel(item.category)}</TableCell>
              <TableCell className="font-mono text-sm text-zinc-500">{formatDate(item.procurement_date)}</TableCell>
              <TableCell className="font-mono text-sm">{item.quantity}</TableCell>
              <TableCell className="font-mono text-sm">{formatCurrency(Number(item.unit_price))}</TableCell>
              <TableCell className="font-mono font-bold text-emerald-700 text-sm">{formatCurrency(Number(item.total_price))}</TableCell>
              <TableCell>
                {item.invoice_urls && item.invoice_urls.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.invoice_urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(url)}
                        className="relative block w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 hover:border-primary-500 hover:shadow-md transition-all group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Invoice ${idx + 1}`} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-400 text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button isIconOnly color="default" variant="light" size="sm" onClick={() => onEdit(item)}>
                    <Pencil size={16} className="text-zinc-500" />
                  </Button>
                  <Button isIconOnly color="danger" variant="light" size="sm" onClick={() => onDelete(item.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    {selectedImage && (
      <Modal isOpen onClose={() => setSelectedImage(null)} title={AR.procurement.invoiceImage}>
        <div className="flex justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selectedImage} alt="Invoice Full" className="max-w-full max-h-[75vh] rounded-xl shadow-sm object-contain" />
        </div>
      </Modal>
    )}
    </>
  );
}

// ─── Add Procurement Modal ─────────────────────────────────────────
function AddProcurementModal({
  onClose,
  onSubmit,
  initialData,
}: {
  onClose: () => void;
  onSubmit: (data: ProcurementFormData, invoiceUrls: string[]) => Promise<void>;
  initialData?: any;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
  const [existingInvoices, setExistingInvoices] = useState<string[]>(initialData?.invoice_urls || []);
  const [uploadProgress, setUploadProgress] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const { addToast } = useToast();
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  useEffect(() => {
    import("@/config/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.from("procurement_log").select("category").then(({ data }: any) => {
        if (data) setCustomCategories(Array.from(new Set(data.map((d: any) => d.category))));
      });
    });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProcurementFormData>({
    resolver: zodResolver(procurementSchema),
    defaultValues: initialData || { procurement_date: new Date().toISOString().split("T")[0] },
  });

  const quantity = watch("quantity") || 0;
  const unitPrice = watch("unit_price") || 0;
  const calculatedTotal = Number(quantity) * Number(unitPrice);

  const onFormSubmit = async (data: ProcurementFormData) => {
    setInvoiceError("");
    setSubmitting(true);
    try {
      let invoiceUrls = [...existingInvoices];
      if (invoiceFiles.length > 0) {
        setUploadProgress("جاري رفع الفواتير...");
        const newUrls = await Promise.all(
          invoiceFiles.map(file => compressAndUploadImage(file))
        );
        invoiceUrls = [...invoiceUrls, ...newUrls];
      }
      setUploadProgress("");
      await onSubmit(data, invoiceUrls as any);
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
          <Button color="default" variant="light" onPress={onClose} isDisabled={submitting}>
            {AR.general.cancel}
          </Button>
          <Button color="primary" onPress={() => { handleSubmit(onFormSubmit)(); }} isLoading={submitting}>
            {submitting && uploadProgress ? uploadProgress : AR.general.save}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onFormSubmit)}>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.procurement.itemName}</label>
          <input {...register("item_name")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" placeholder="مثال: أسلاك كهرباء 2.5مم" />
          {errors.item_name && <p className="text-xs text-rose-600 mt-1">{errors.item_name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.procurement.category}</label>
          <input 
            list="procurement-categories"
            {...register("category")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            placeholder="اختر أو اكتب فئة جديدة..."
            autoComplete="off"
          />
          <datalist id="procurement-categories">
            {PROCUREMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
            {customCategories.filter(c => !PROCUREMENT_CATEGORIES.find(pc => pc.value === c)).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.category && <p className="text-xs text-rose-600 mt-1">{errors.category.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.financial.date}</label>
          <input type="date" {...register("procurement_date")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          {errors.procurement_date && <p className="text-xs text-rose-600 mt-1">{errors.procurement_date.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.procurement.quantity}</label>
            <input type="number" step="0.01" {...register("quantity", { valueAsNumber: true })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            {errors.quantity && <p className="text-xs text-rose-600 mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.procurement.unitPrice}</label>
            <input type="number" step="0.01" {...register("unit_price", { valueAsNumber: true })} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            {errors.unit_price && <p className="text-xs text-rose-600 mt-1">{errors.unit_price.message}</p>}
          </div>
        </div>

        {/* Calculated Total */}
        {calculatedTotal > 0 && (
          <div className="bg-zinc-100/80 border border-zinc-200/50 rounded-xl p-3 flex justify-between items-center mt-2">
            <span className="text-xs font-semibold text-zinc-700">{AR.procurement.totalPrice}</span>
            <span className="font-mono font-bold text-emerald-700">{formatCurrency(calculatedTotal)}</span>
          </div>
        )}

        {/* Invoice Upload - OPTIONAL */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            {AR.procurement.invoiceImage} <span className="text-zinc-400 font-normal">(اختياري)</span>
          </label>
          <div className="border border-dashed border-zinc-300 rounded-xl p-4 text-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
            <Camera size={24} className="mx-auto mb-2 text-zinc-400" />
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setInvoiceFiles((prev) => [...prev, ...files]);
                setInvoiceError("");
              }}
              className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer"
            />
          </div>
          
          {(invoiceFiles.length > 0 || existingInvoices.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-3 bg-zinc-50 p-2 rounded-xl border border-zinc-200/60">
              {existingInvoices.map((url, i) => (
                <div key={`existing-${i}`} className="relative group w-12 h-12 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="existing preview" className="w-full h-full object-cover rounded-lg shadow-sm border border-zinc-200" />
                  <button 
                    type="button" 
                    onClick={() => setExistingInvoices(prev => prev.filter((_, idx) => idx !== i))} 
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {invoiceFiles.map((f, i) => (
                <div key={`new-${i}`} className="relative group w-12 h-12 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover rounded-lg shadow-sm border border-zinc-200" />
                  <button 
                    type="button" 
                    onClick={() => setInvoiceFiles(prev => prev.filter((_, idx) => idx !== i))} 
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {invoiceError && <p className="text-xs text-rose-600 mt-1 text-center">{invoiceError}</p>}
        </div>
      </form>
    </Modal>
  );
}

// ─── Supervisor Logs Table ───────────────────────────────────────
function SupervisorTable({ logs, onEdit, onDelete, onTogglePaid }: { logs: SupervisorLog[]; onEdit: (item: SupervisorLog) => void; onDelete: (id: string) => void; onTogglePaid: (log: SupervisorLog, status: boolean) => void }) {
  const totalDays = logs.length;
  const unpaidDays = logs.filter(l => !l.is_paid).length;
  const totalPaidAmount = logs.filter(l => l.is_paid).reduce((sum, l) => sum + (l.has_laborer ? 1100 : 750), 0);

  return (
    <div>
      {/* Supervisor Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-heading font-bold text-zinc-500 mb-1">إجمالي أيام العمل</p>
            <h4 className="text-lg xl:text-xl font-bold font-mono text-zinc-900">{totalDays} يوم</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <UserCog size={20} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-heading font-bold text-zinc-500 mb-1">الأيام غير المدفوعة</p>
            <h4 className="text-lg xl:text-xl font-bold font-mono text-rose-600">{unpaidDays} يوم</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <TrendingDown size={20} />
          </div>
        </div>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 flex items-center justify-between shadow-md hover:shadow-lg transition-all group gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-heading font-bold text-zinc-400 mb-1">إجمالي المدفوع</p>
            <h4 className="text-lg xl:text-xl font-bold font-mono text-emerald-400">{formatCurrency(totalPaidAmount)}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Banknote size={20} />
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-zinc-400"><p>{AR.general.noData}</p></div>
      ) : (
        <div className="overflow-x-auto w-full pb-4">
          <Table aria-label="Supervisor logs table" shadow="sm" className="min-w-[700px]">
            <TableHeader>
              <TableColumn>التاريخ واليوم</TableColumn>
              <TableColumn>بيان الأعمال</TableColumn>
              <TableColumn>حالة الدفع</TableColumn>
              <TableColumn align="center">{AR.general.actions}</TableColumn>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className={log.is_paid ? "bg-emerald-50/40" : ""}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 text-sm">{log.day_name}</span>
                        <span className="font-mono text-zinc-500 text-xs">({formatDate(log.work_date)})</span>
                      </div>
                      {log.has_laborer && <span className="text-[10px] bg-indigo-100 text-indigo-700 w-fit px-1.5 py-0.5 rounded font-bold">مع عامل (+350 ج)</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-700 whitespace-pre-wrap">{log.description}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => onTogglePaid(log, !log.is_paid)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        log.is_paid 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                        : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      }`}
                    >
                      {log.is_paid ? <><CheckCircle size={12} /> مدفوع</> : <><Wallet size={12} /> غير مدفوع</>}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button isIconOnly color="default" variant="light" size="sm" onClick={() => onEdit(log)}>
                        <Pencil size={16} className="text-zinc-500" />
                      </Button>
                      <Button isIconOnly color="danger" variant="light" size="sm" onClick={() => onDelete(log.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Add Supervisor Modal ─────────────────────────────────────────
function AddSupervisorModal({
  onClose,
  onSubmit,
  initialData,
}: {
  onClose: () => void;
  onSubmit: (data: SupervisorLogFormData) => Promise<void>;
  initialData?: any;
}) {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(supervisorLogSchema) as any,
    defaultValues: initialData || { work_date: new Date().toISOString().split("T")[0] },
  });

  const onFormSubmit = async (data: SupervisorLogFormData) => {
    setSubmitting(true);
    try {
      const dateObj = new Date(data.work_date);
      const dayName = new Intl.DateTimeFormat("ar-EG", { weekday: "long" }).format(dateObj);
      await onSubmit({ ...data, day_name: dayName });
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
      title="إضافة يومية مشرف"
      footer={
        <>
          <Button color="default" variant="light" onPress={onClose} isDisabled={submitting}>
            {AR.general.cancel}
          </Button>
          <Button color="primary" onPress={() => handleSubmit(onFormSubmit)()} isLoading={submitting}>
            {AR.general.save}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onFormSubmit)}>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">التاريخ</label>
          <input type="date" {...register("work_date")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          {errors.work_date && <p className="text-xs text-rose-600 mt-1">{String(errors.work_date.message)}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">بيان الأعمال التي قام بها</label>
          <textarea {...register("description")} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" rows={4} placeholder="اكتب ما تم إنجازه اليوم..." />
          {errors.description && <p className="text-xs text-rose-600 mt-1">{String(errors.description.message)}</p>}
        </div>
        
        <label className="flex items-center gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
          <input type="checkbox" {...register("has_laborer")} className="w-4 h-4 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-600" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-indigo-900">يوجد عامل مساعد</span>
            <span className="text-xs text-indigo-600 font-mono">+350 ج يومية إضافية</span>
          </div>
        </label>
      </form>
    </Modal>
  );
}


