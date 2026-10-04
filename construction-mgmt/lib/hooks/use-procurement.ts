"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/config/supabase/client";
import type { ProcurementItem } from "@/lib/types";
import type { ProcurementFormData } from "@/lib/validations";
import { useToast } from "@/components/toast-provider";
import { AR } from "@/config/constants";

export function useProcurement(projectId: string) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchItems = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("procurement_log")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as ProcurementItem[];
  }, [projectId]);

  const addItem = useCallback(
    async (formData: ProcurementFormData, invoiceUrls: string[]) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error: procError } = await supabase.from("procurement_log").insert({
          ...formData,
          project_id: projectId,
          invoice_urls: invoiceUrls,
        });
        if (procError) throw procError;

        // Automatically mirror this procurement into the general expenses log
        const { error: expError } = await supabase.from("general_expenses").insert({
          project_id: projectId,
          amount: Number(formData.quantity) * Number(formData.unit_price),
          category: formData.category, // Copying exact category from procurement
          description: `مشتريات: ${formData.item_name}`,
          expense_date: formData.procurement_date, // Copying exact date from procurement
        });
        if (expError) throw expError;

        addToast(AR.general.success);
      } catch (err: any) {
        addToast(err.message || err.details || AR.general.error, "error");
        console.error("Procurement Error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, addToast]
  );

  const updateItem = useCallback(
    async (id: string, formData: ProcurementFormData, invoiceUrls?: string[]) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const payload: any = { ...formData };
        if (invoiceUrls !== undefined) {
          payload.invoice_urls = invoiceUrls;
        }
        const { error } = await supabase.from("procurement_log").update(payload).eq("id", id);
        if (error) throw error;
        addToast(AR.general.success);
      } catch (err: any) {
        addToast(err.message || AR.general.error, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("procurement_log").delete().eq("id", id);
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

  return { loading, fetchItems, addItem, updateItem, deleteItem };
}
