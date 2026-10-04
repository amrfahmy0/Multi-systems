"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/config/supabase/client";
import type { ClientPayment, GeneralExpense, SupervisorLog } from "@/lib/types";
import type { ClientPaymentFormData, GeneralExpenseFormData, SupervisorLogFormData } from "@/lib/validations";
import { useToast } from "@/components/toast-provider";
import { AR } from "@/config/constants";

export function useFinancials(projectId: string) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // ─── Client Payments ─────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("client_payments")
      .select("*")
      .eq("project_id", projectId)
      .order("payment_date", { ascending: false });
    if (error) throw error;
    return data as ClientPayment[];
  }, [projectId]);

  const addPayment = useCallback(
    async (formData: ClientPaymentFormData) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("client_payments").insert({
          ...formData,
          project_id: projectId,
        });
        if (error) throw error;
        addToast(AR.general.success);
      } catch (err) {
        addToast(AR.general.error, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, addToast]
  );

  const updatePayment = useCallback(
    async (id: string, formData: ClientPaymentFormData) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("client_payments").update(formData).eq("id", id);
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

  const deletePayment = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("client_payments").delete().eq("id", id);
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

  // ─── General Expenses ────────────────────────────────────────────
  const fetchExpenses = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("general_expenses")
      .select("*")
      .eq("project_id", projectId)
      .order("expense_date", { ascending: false });
    if (error) throw error;
    return data as GeneralExpense[];
  }, [projectId]);

  const addExpense = useCallback(
    async (formData: GeneralExpenseFormData) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("general_expenses").insert({
          ...formData,
          project_id: projectId,
        });
        if (error) throw error;
        addToast(AR.general.success);
      } catch (err) {
        addToast(AR.general.error, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, addToast]
  );

  const updateExpense = useCallback(
    async (id: string, formData: GeneralExpenseFormData) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("general_expenses").update(formData).eq("id", id);
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

  const deleteExpense = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("general_expenses").delete().eq("id", id);
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

  // ─── Supervisor Logs ─────────────────────────────────────────────
  const fetchSupervisorLogs = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("supervisor_logs")
      .select("*")
      .eq("project_id", projectId)
      .order("work_date", { ascending: false });
    if (error) throw error;
    return data as SupervisorLog[];
  }, [projectId]);

  const addSupervisorLog = useCallback(
    async (formData: SupervisorLogFormData) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("supervisor_logs").insert({
          ...formData,
          project_id: projectId,
        });
        if (error) throw error;
        addToast(AR.general.success);
      } catch (err: any) {
        addToast(err.message || AR.general.error, "error");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, addToast]
  );

  const toggleSupervisorPaid = useCallback(
    async (log: SupervisorLog, is_paid: boolean) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("supervisor_logs").update({ is_paid }).eq("id", log.id);
        if (error) throw error;

        const amount = log.has_laborer ? 1100 : 750;
        const descPrefix = log.has_laborer ? "يومية إشراف وعامل" : "يومية إشراف";
        const description = `${descPrefix}: ${log.day_name}`;
        
        if (is_paid) {
          // Insert matching expense
          const { error: expError } = await supabase.from("general_expenses").insert({
            project_id: projectId,
            amount,
            category: "supervisor_wage",
            description,
            expense_date: log.work_date,
          });
          if (expError) throw expError;
        } else {
          // Delete matching expense
          const { error: expError } = await supabase.from("general_expenses").delete()
            .eq("project_id", projectId)
            .eq("amount", amount)
            .eq("category", "supervisor_wage")
            .eq("description", description)
            .eq("expense_date", log.work_date);
          if (expError) throw expError;
        }

        addToast(AR.general.success);
      } catch (err: any) {
        addToast(err.message || AR.general.error, "error");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const updateSupervisorLog = useCallback(
    async (id: string, formData: SupervisorLogFormData) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("supervisor_logs").update(formData).eq("id", id);
        if (error) throw error;
        addToast(AR.general.success);
      } catch (err: any) {
        addToast(err.message || AR.general.error, "error");
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const deleteSupervisorLog = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("supervisor_logs").delete().eq("id", id);
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
    toggleSupervisorPaid,
    deleteSupervisorLog,
  };
}
