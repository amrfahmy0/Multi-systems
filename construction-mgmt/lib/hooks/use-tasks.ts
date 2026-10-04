"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/config/supabase/client";
import type { ProjectTask, TaskStatus } from "@/lib/types";
import type { TaskFormData } from "@/lib/validations";
import { useToast } from "@/components/toast-provider";
import { AR } from "@/config/constants";

export function useTasks(projectId: string) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as ProjectTask[];
  }, [projectId]);

  const addTask = useCallback(
    async (formData: TaskFormData) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("project_tasks").insert({
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

  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("project_tasks")
          .update({ status })
          .eq("id", id);
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

  const deleteTask = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("project_tasks").delete().eq("id", id);
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

  return { loading, fetchTasks, addTask, updateTaskStatus, deleteTask };
}
