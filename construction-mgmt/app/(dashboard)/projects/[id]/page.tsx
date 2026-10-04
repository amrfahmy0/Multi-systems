"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Receipt,
  ShoppingCart,
  ListChecks,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Home
} from "lucide-react";
import { AR, PROJECT_STATUSES } from "@/config/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useProjects } from "@/lib/hooks/use-projects";
import type { ProjectWithFinancials } from "@/lib/types";
import { useToast } from "@/components/toast-provider";
import { Modal } from "@/components/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormData } from "@/lib/validations";
import { Button } from "@nextui-org/react";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectWithFinancials | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const { fetchProjectWithFinancials, updateProject } = useProjects();
  const { addToast } = useToast();

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProjectWithFinancials(projectId);
      setProject(data as ProjectWithFinancials);
    } catch {
      addToast(AR.general.error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-4 w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card"><div className="skeleton h-16" /></div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="empty-state">
        <p>{AR.general.error}</p>
        <Link href="/" className="btn-secondary inline-block mt-4">
          {AR.general.back}
        </Link>
      </div>
    );
  }

  const quickLinks = [
    { href: `/projects/${projectId}/financials`, label: AR.nav.financials, description: "إدارة المدفوعات، المصروفات، المشتريات والرواتب", icon: Receipt, color: "from-emerald-400 to-emerald-600", lightBg: "bg-emerald-50", iconColor: "text-emerald-500" },
    { href: `/projects/${projectId}/tasks`, label: AR.nav.tasks, description: "متابعة المهام اليومية، الإنجازات وسير العمل", icon: ListChecks, color: "from-blue-400 to-blue-600", lightBg: "bg-blue-50", iconColor: "text-blue-500" },
    { href: `/projects/${projectId}/documents`, label: AR.nav.documents, description: "إصدار عروض الأسعار والمستخلصات وحفظ المستندات", icon: FileText, color: "from-purple-400 to-purple-600", lightBg: "bg-purple-50", iconColor: "text-purple-500" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold bg-white/70 backdrop-blur-md border border-zinc-200/50 shadow-sm px-4 py-2.5 rounded-2xl w-fit mb-2 max-w-full">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-primary-600 transition-colors">
          <Home size={16} />
          <span>{AR.nav.dashboard}</span>
        </Link>
        <ChevronLeft size={16} className="text-zinc-300 rtl:rotate-180" />
        <div className="flex items-center gap-2 text-primary-700 bg-primary-50 px-3 py-1 rounded-lg">
          <span>{project.name}</span>
        </div>
      </div>

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white shadow-xl">
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-white drop-shadow-sm">{project.name}</h1>
              <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 ${project.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : project.status === 'completed' ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {project.status === 'active' ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> : project.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                {AR.status[project.status]}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 font-medium mt-1">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                <Settings size={14} className="text-zinc-500" />
                <span className="text-zinc-300">{project.client_name}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                <Calendar size={14} className="text-zinc-500" />
                <span className="text-zinc-300">{formatDate(project.start_date)}</span>
              </div>
              {project.location && (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                  <MapPin size={14} className="text-zinc-500" />
                  <span className="text-zinc-300">{project.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            size="md"
            color="default" 
            variant="flat" 
            startContent={<Settings size={16} />} 
            onClick={() => setShowEditModal(true)}
            className="text-white bg-white/10 hover:bg-white/20 border border-white/10 font-semibold rounded-xl backdrop-blur-md transition-all shrink-0"
          >
            {AR.general.edit}
          </Button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="group block h-full">
            <div className="relative h-full bg-white rounded-3xl border border-zinc-200/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden p-8 flex flex-col justify-between gap-6">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${link.color} opacity-5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="flex flex-col gap-4 relative z-10">
                <div className={`w-16 h-16 ${link.lightBg} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  <link.icon size={28} className={link.iconColor} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold font-heading text-2xl text-zinc-800 mb-2 group-hover:text-primary-600 transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                    {link.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 group-hover:text-primary-600 transition-colors mt-4 relative z-10">
                <span>الدخول للقسم</span>
                <ChevronLeft size={16} className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (data) => {
            await updateProject(projectId, data);
            setShowEditModal(false);
            loadProject();
          }}
        />
      )}
    </div>
  );
}

function EditProjectModal({
  project,
  onClose,
  onSubmit,
}: {
  project: ProjectWithFinancials;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      client_name: project.client_name,
      location: project.location || "",
      status: project.status,
      start_date: project.start_date,
    },
  });

  const onFormSubmit = async (data: ProjectFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${AR.general.edit} - ${project.name}`}
      footer={
        <>
          <Button color="default" variant="light" onPress={onClose} isDisabled={submitting}>
            {AR.general.cancel}
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit(onFormSubmit)}
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
          />
          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.project.clientName}</label>
          <input 
            {...register("client_name")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
          />
          {errors.client_name && <p className="text-xs text-rose-600 mt-1">{errors.client_name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">الموقع</label>
          <input 
            {...register("location")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
            placeholder="مثال: العاصمة الإدارية - كمبوند سيليا" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.project.startDate}</label>
          <input 
            type="date" 
            {...register("start_date")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.project.status}</label>
          <select 
            {...register("status")} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
