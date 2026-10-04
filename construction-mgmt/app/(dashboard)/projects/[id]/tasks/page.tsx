"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Clock, CheckCircle2, Circle, AlertCircle, Loader2, Home, ChevronLeft, ListChecks, Calendar as CalendarIcon, X } from "lucide-react";
import { AR, TASK_PHASES } from "@/config/constants";
import { useTasks } from "@/lib/hooks/use-tasks";
import type { ProjectTask, TaskStatus } from "@/lib/types";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskFormData } from "@/lib/validations";
import { Button, Popover, PopoverTrigger, PopoverContent, Calendar } from "@nextui-org/react";
import { parseDate } from "@internationalized/date";

const STATUS_CONFIG: Record<TaskStatus, { icon: typeof Circle; color: string; next: TaskStatus; label: string; bg: string }> = {
  pending: { icon: Circle, color: "text-zinc-400", bg: "bg-zinc-100", next: "in_progress", label: AR.taskStatus.pending },
  in_progress: { icon: Loader2, color: "text-amber-500", bg: "bg-amber-100", next: "completed", label: AR.taskStatus.in_progress },
  completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-100", next: "pending", label: AR.taskStatus.completed },
  blocked: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-100", next: "pending", label: AR.taskStatus.blocked },
};

export default function TasksPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { loading: mutationLoading, fetchTasks, addTask, updateTaskStatus, deleteTask } = useTasks(projectId);
  const { addToast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { status: "pending", task_dates: [], phase: TASK_PHASES[0].value }
  });

  const taskDates = watch("task_dates") || [];

  const handleCalendarSelect = (date: any) => {
    if (!date) return;
    const val = date.toString();
    if (taskDates.includes(val)) {
      setValue("task_dates", taskDates.filter((d: string) => d !== val));
    } else {
      setValue("task_dates", [...taskDates, val].sort());
    }
  };

  const removeDate = (dateToRemove: string) => {
    setValue("task_dates", taskDates.filter((d: string) => d !== dateToRemove));
  };

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      addToast(AR.general.error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusToggle = async (task: ProjectTask) => {
    const next = STATUS_CONFIG[task.status].next;
    await updateTaskStatus(task.id, next);
    loadTasks();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget);
      setDeleteTarget(null);
      loadTasks();
    } catch { /* handled by hook */ }
  };

  const onQuickAdd = async (data: TaskFormData) => {
    setAddingTask(true);
    try {
      await addTask(data);
      reset({ task_name: "", task_dates: [], phase: data.phase, status: "pending" });
      loadTasks();
    } catch {
    } finally {
      setAddingTask(false);
    }
  };

  const phaseLabel = (value: string) => {
    const phase = TASK_PHASES.find((p) => p.value === value);
    return phase ? phase.label : value;
  };

  // Group tasks by phase
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.phase]) acc[task.phase] = [];
    acc[task.phase].push(task);
    return acc;
  }, {} as Record<string, ProjectTask[]>);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatDateWithDay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("ar-EG", { weekday: "long", month: "short", day: "numeric" }).format(date);
  };

  return (
    <div className="pb-10">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold bg-white/70 backdrop-blur-md border border-zinc-200/50 shadow-sm px-4 py-2.5 rounded-2xl w-fit mb-4 max-w-full">
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
          <span>{AR.task.title}</span>
        </div>
      </div>

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white shadow-xl mb-8">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/20 text-primary-300 flex items-center justify-center shrink-0 border border-primary-500/30">
              <ListChecks size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-black tracking-tight text-white">{AR.task.title}</h1>
              <p className="text-zinc-400 text-sm mt-1">تتبع مهام المشروع اليومية ومتابعة نسبة الإنجاز بسهولة</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex flex-col gap-1 min-w-[120px]">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">المهام</span>
              <span className="text-2xl font-bold font-mono">{tasks.length}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex flex-col gap-1 min-w-[120px]">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">الإنجاز</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar in Header */}
        {totalTasks > 0 && (
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-zinc-300">التقدم الإجمالي</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{completedTasks} / {totalTasks} مهمة</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden w-full backdrop-blur-sm border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Form (For Mobile & Desktop) */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-primary-500"></div>
        <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-primary-500" />
          إضافة مهمة سريعة
        </h2>
        <form className="flex flex-col md:flex-row gap-4 items-start md:items-end" onSubmit={handleSubmit(onQuickAdd)}>
          <div className="w-full md:flex-1">
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.task.taskName}</label>
            <input 
              {...register("task_name")} 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
              placeholder="اكتب المهمة (مثال: صب أعمدة الدور الأول)..."
            />
            {errors.task_name && <p className="text-xs text-rose-600 mt-1">{errors.task_name.message}</p>}
          </div>
          
          <div className="w-full md:w-48 shrink-0">
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.task.phase}</label>
            <select 
              {...register("phase")} 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            >
              {TASK_PHASES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {errors.phase && <p className="text-xs text-rose-600 mt-1">{errors.phase.message}</p>}
          </div>

          <div className="w-full md:w-64 shrink-0">
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{AR.task.expectedDays || "التواريخ"}</label>
            <Popover placement="bottom" isOpen={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger>
                <button
                  type="button"
                  className="w-full flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-zinc-600"
                >
                  <span className="flex items-center gap-2">
                    <CalendarIcon size={16} className="text-zinc-400" />
                    {taskDates.length > 0 ? `${taskDates.length} أيام محددة` : "اختر التواريخ"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar 
                  aria-label="Select Dates"
                  onChange={handleCalendarSelect}
                />
                <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                  <Button size="sm" color="primary" onClick={() => setIsCalendarOpen(false)}>
                    تم
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {taskDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {taskDates.map((date: string) => (
                  <div key={date} className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-[10px] font-bold">
                    {formatDateWithDay(date)}
                    <button type="button" onClick={() => removeDate(date)} className="text-primary-400 hover:text-primary-700"><X size={12}/></button>
                  </div>
                ))}
              </div>
            )}
            {errors.task_dates && <p className="text-xs text-rose-600 mt-1">{errors.task_dates.message}</p>}
          </div>

          <Button 
            type="submit"
            color="primary" 
            variant="shadow" 
            isLoading={addingTask}
            className="w-full md:w-auto h-[46px] px-8 rounded-xl font-bold bg-primary-600 shadow-primary-500/30"
          >
            إضافة
          </Button>
        </form>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl w-full" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-zinc-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
            <ListChecks size={32} className="text-zinc-300" />
          </div>
          <p className="font-bold text-zinc-500 text-lg">{AR.task.noTasks}</p>
          <p className="text-sm text-zinc-400 mt-1 max-w-sm">يمكنك إضافة مهام سريعة من خلال النموذج أعلاه لمتابعة تقدم المشروع</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
          {Object.entries(groupedTasks).map(([phase, phaseTasks]) => (
            <div key={phase} className="bg-zinc-50/50 rounded-3xl p-6 border border-zinc-100 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-zinc-100 text-primary-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">{phaseLabel(phase)}</h2>
                    <p className="text-xs font-semibold text-zinc-500">
                      {phaseTasks.filter((t) => t.status === "completed").length} من {phaseTasks.length} مكتمل
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {phaseTasks.map((task) => {
                  const config = STATUS_CONFIG[task.status];
                  const Icon = config.icon;

                  return (
                    <div
                      key={task.id}
                      className={`group relative flex items-center gap-4 p-4 bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm ${
                        task.status === "completed" ? "opacity-60" : ""
                      }`}
                    >
                      {/* Status Toggle */}
                      <button
                        onClick={() => handleStatusToggle(task)}
                        className={`flex items-center justify-center w-12 h-12 rounded-xl border shrink-0 transition-all ${
                          task.status === "completed" 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-500" 
                            : task.status === "in_progress" 
                            ? "bg-amber-50 border-amber-200 text-amber-500"
                            : task.status === "blocked"
                            ? "bg-rose-50 border-rose-200 text-rose-500"
                            : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:border-primary-300 hover:text-primary-500"
                        }`}
                        title={STATUS_CONFIG[config.next].label}
                      >
                        <Icon size={24} className={task.status === "in_progress" ? "animate-spin" : ""} strokeWidth={2} />
                      </button>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <p className={`text-base font-bold text-zinc-800 leading-tight ${task.status === "completed" ? "line-through text-zinc-500" : ""}`}>
                          {task.task_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          {task.task_dates?.map((d) => (
                            <span key={d} className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-md">
                              <CalendarIcon size={12} />
                              {formatDateWithDay(d)}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Delete */}
                      <Button
                        isIconOnly
                        variant="light"
                        color="danger"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 absolute left-4 top-1/2 -translate-y-1/2 rtl:left-4 rtl:right-auto"
                        onClick={() => setDeleteTarget(task.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={AR.general.delete}
        message="هل أنت متأكد من حذف هذه المهمة؟"
        confirmLabel={AR.general.delete}
        loading={mutationLoading}
      />
    </div>
  );
}
