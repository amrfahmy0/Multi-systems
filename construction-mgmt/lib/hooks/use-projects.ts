"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/config/supabase/client";
import type { Project } from "@/lib/types";
import type { ProjectFormData } from "@/lib/validations";
import { useToast } from "@/components/toast-provider";
import { AR } from "@/config/constants";

export function useProjects() {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchProjects = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  }, []);

  const fetchProjectWithFinancials = useCallback(
    async (projectId: string) => {
      const supabase = createClient();
      const [projectRes, paymentsRes, expensesRes, procurementRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase.from("client_payments").select("amount").eq("project_id", projectId),
        supabase.from("general_expenses").select("amount").eq("project_id", projectId),
        supabase.from("procurement_log").select("total_price").eq("project_id", projectId),
      ]);

      if (projectRes.error) throw projectRes.error;

      const totalReceived = (paymentsRes.data || []).reduce((sum: number, p: Record<string, unknown>) => sum + Number(p.amount), 0);
      const totalExpenses = (expensesRes.data || []).reduce((sum: number, e: Record<string, unknown>) => sum + Number(e.amount), 0);
      const totalPurchases = (procurementRes.data || []).reduce((sum: number, item: Record<string, unknown>) => sum + Number(item.total_price), 0);

      return {
        ...projectRes.data,
        total_received: totalReceived,
        total_expenses: totalExpenses,
        total_purchases: totalPurchases,
        balance: totalReceived - totalExpenses - totalPurchases,
      };
    },
    []
  );

  const createProject = useCallback(
    async (data: ProjectFormData) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("projects").insert(data);
        if (error) throw error;
        addToast(AR.general.success);
      } catch (err) {
        addToast(AR.general.error, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const updateProject = useCallback(
    async (id: string, data: Partial<ProjectFormData>) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("projects").update(data).eq("id", id);
        if (error) throw error;
        addToast(AR.general.success);
      } catch (err) {
        addToast(AR.general.error, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw error;
        addToast(AR.general.success);
      } catch (err) {
        addToast(AR.general.error, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  return {
    loading,
    fetchProjects,
    fetchProjectWithFinancials,
    createProject,
    updateProject,
    deleteProject,
  };
}
