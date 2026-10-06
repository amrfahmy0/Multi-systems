"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, TrendingUp, TrendingDown, DollarSign, FolderOpen, Trash2, Building2, Calendar, Clock, CheckCircle2, Home, ChevronLeft, ArrowLeft } from "lucide-react";
import { AR, PROJECT_STATUSES } from "@/config/constants";
import { formatCurrency } from "@/lib/utils";
import { useProjects } from "@/lib/hooks/use-projects";
import type { Project, ProjectWithFinancials } from "@/lib/types";
import { createClient } from "@/config/supabase/client";
import { Modal, ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormData } from "@/lib/validations";
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { NumberInput } from "@/components/ui/number-input";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithFinancials[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { createProject, deleteProject, loading: isMutating } = useProjects();
  const { addToast } = useToast();

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!projectsData) {
        setProjects([]);
        return;
      }

      // Fetch financials for each project
      const enriched = await Promise.all(
        projectsData.map(async (project: Project) => {
          const [payments, expenses] = await Promise.all([
            supabase.from("client_payments").select("amount").eq("project_id", project.id),
            supabase.from("general_expenses").select("amount").eq("project_id", project.id),
          ]);

          const totalReceived = (payments.data || []).reduce(
            (s: number, p: Record<string, unknown>) => s + Number(p.amount),
            0
          );
          const totalExpenses =
            (expenses.data || []).reduce((s: number, e: Record<string, unknown>) => s + Number(e.amount), 0);

          return {
            ...project,
            total_received: totalReceived,
            total_expenses: totalExpenses,
            balance: totalReceived - totalExpenses,
          };
        })
      );

      setProjects(enriched);
    } catch {
      addToast(AR.general.error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totals = projects.reduce(
    (acc, p) => ({
      received: acc.received + p.total_received,
      expenses: acc.expenses + p.total_expenses,
      balance: acc.balance + p.balance,
    }),
    { received: 0, expenses: 0, balance: 0 }
  );

  return (
    <div className="flex flex-col gap-8 w-full h-full pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 bg-white/60 backdrop-blur-md border border-zinc-200/50 shadow-sm px-4 py-2.5 rounded-2xl w-fit mb-2">
        <div className="flex items-center gap-2 text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
          <Home size={16} />
          <span>{AR.nav.dashboard}</span>
        </div>
      </div>

      {/* Premium Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white shadow-xl">
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-white drop-shadow-sm">{AR.nav.dashboard}</h1>
            <p className="text-zinc-400 font-medium text-sm md:text-base flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              {projects.length} {AR.project.title} مسجلة في النظام
            </p>
          </div>
          <Button 
            size="lg"
            color="primary" 
            variant="shadow" 
            startContent={<Plus size={20} />} 
            onClick={() => setShowNewModal(true)}
            className="text-white font-bold shadow-primary-500/30 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 px-8 transition-all"
          >
            {AR.project.newProject}
          </Button>
        </div>
        
        {/* Quick Stats Overlay (if projects exist) */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">إجمالي المشاريع</span>
              <span className="text-xl sm:text-2xl font-bold font-mono">{projects.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">نشط حالياً</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{projects.filter(p => p.status === 'active').length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">مكتمل</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-primary-400">{projects.filter(p => p.status === 'completed').length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">متوقف</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">{projects.filter(p => p.status === 'on_hold').length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="rounded-xl border-none shadow-md bg-white">
              <CardBody className="p-0">
                <div className="animate-pulse flex flex-col h-full">
                  <div className="p-6 pb-4 border-b border-zinc-100">
                    <div className="h-6 bg-zinc-200 rounded w-2/3 mb-3"></div>
                    <div className="h-4 bg-zinc-100 rounded w-1/3"></div>
                  </div>
                  <div className="p-6 bg-zinc-50/50 flex-grow">
                    <div className="h-20 bg-zinc-100 rounded w-full"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400 mt-4 bg-white rounded-3xl border border-zinc-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <FolderOpen size={48} className="text-primary-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-zinc-800 mb-2">{AR.project.noProjects}</h3>
            <p className="text-zinc-500 mb-8 max-w-sm text-center leading-relaxed">{AR.project.createFirst}</p>
            <Button 
              size="lg"
              color="primary" 
              variant="shadow" 
              startContent={<Plus size={18} />} 
              onClick={() => setShowNewModal(true)}
              className="font-bold rounded-2xl px-8 shadow-primary-500/20"
            >
              {AR.project.newProject}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full mt-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block h-full group">
              <div className="relative h-full flex flex-col bg-white rounded-3xl border border-zinc-200/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                {/* Top Gradient Accent */}
                <div className={`absolute top-0 inset-x-0 h-1.5 w-full ${project.status === 'active' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : project.status === 'completed' ? 'bg-gradient-to-r from-primary-400 to-primary-600' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}></div>
                
                {/* Card Header */}
                <div className="p-6 pb-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${project.status === 'active' ? 'bg-emerald-50 text-emerald-600' : project.status === 'completed' ? 'bg-primary-50 text-primary-600' : 'bg-amber-50 text-amber-600'}`}>
                        <Building2 size={24} strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold font-heading text-lg text-zinc-900 leading-tight line-clamp-2">
                          {project.name}
                        </h3>
                        <p className="text-sm font-medium text-zinc-500 line-clamp-1">{project.client_name}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 ${project.status === 'active' ? 'bg-emerald-100/80 text-emerald-700' : project.status === 'completed' ? 'bg-primary-100/80 text-primary-700' : 'bg-amber-100/80 text-amber-800'}`}>
                        {project.status === 'active' ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> : project.status === 'completed' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {AR.status[project.status]}
                      </div>
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light" 
                        color="danger" 
                        className="text-zinc-300 hover:text-rose-600 z-20 hover:bg-rose-50"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(project.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="px-6">
                  <div className="w-full h-px bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100"></div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-5 bg-zinc-50/30 flex items-center justify-between mt-auto group-hover:bg-zinc-50/80 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Calendar size={14} className="text-zinc-400" />
                    <span className="text-xs font-semibold">{AR.project.startDate}:</span>
                    <span className="font-mono text-sm font-medium text-zinc-700">{new Date(project.start_date).toLocaleDateString("ar-EG")}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-all shadow-sm">
                    <ArrowLeft size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmit={async (data) => {
          await createProject(data);
          setShowNewModal(false);
          loadProjects();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteProject(deleteTarget);
          setDeleteTarget(null);
          loadProjects();
        }}
        title={AR.general.delete}
        message="هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع البيانات المالية والمشتريات والمهام المرتبطة به ولا يمكن التراجع عن هذا الإجراء."
        confirmLabel={AR.general.delete}
        loading={isMutating}
      />
    </div>
  );
}

function NewProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "active",
      start_date: new Date().toISOString().split("T")[0],
      supervisor_daily_wage: 750,
      laborer_daily_wage: 350,
    },
  });

  const onFormSubmit = async (data: ProjectFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={AR.project.newProject}
      footer={
        <>
          <Button color="default" variant="light" onPress={onClose} isDisabled={submitting}>
            {AR.general.cancel}
          </Button>
          <Button
            color="primary"
            onPress={() => { handleSubmit(onFormSubmit)(); }}
            isLoading={submitting}
          >
            {AR.general.save}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onFormSubmit)}>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.project.name}</label>
          <input 
            {...register("name")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
            placeholder="مثال: شقة المعادي - ط٣" 
          />
          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.project.clientName}</label>
          <input 
            {...register("client_name")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
            placeholder="مثال: أ/ محمد أحمد" 
          />
          {errors.client_name && (
            <p className="text-xs text-rose-600 mt-1">{errors.client_name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">الموقع</label>
          <input 
            {...register("location")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
            placeholder="مثال: العاصمة الإدارية - كمبوند سيليا" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">يومية المشرف (ج.م)</label>
            <NumberInput 
              {...register("supervisor_daily_wage", { valueAsNumber: true })} 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono" 
            />
            {errors.supervisor_daily_wage && <p className="text-xs text-rose-600 mt-1">{errors.supervisor_daily_wage.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">يومية العامل (ج.م)</label>
            <NumberInput 
              {...register("laborer_daily_wage", { valueAsNumber: true })} 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono" 
            />
            {errors.laborer_daily_wage && <p className="text-xs text-rose-600 mt-1">{errors.laborer_daily_wage.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.project.startDate}</label>
          <input 
            type="date" 
            {...register("start_date")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
          />
          {errors.start_date && (
            <p className="text-xs text-rose-600 mt-1">{errors.start_date.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.project.status}</label>
          <select 
            {...register("status")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
