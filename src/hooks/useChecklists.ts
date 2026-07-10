// src/hooks/useChecklists.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Checklist } from "../types";

export const useChecklist = (id: string) => {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      const response = await api.get(`/checklist/${id}`);
      return response.data.data.checklist as Checklist;
    },
    enabled: !!id,
  });
};

export const useChecklists = () => {
  return useQuery({
    queryKey: ["checklists"],
    queryFn: async () => {
      const response = await api.get("/checklist");
      return response.data.data.checklists as Checklist[];
    },
  });
};

export const useCreateChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      isPerItem: boolean;
      resetIntervalValue: number | null;
      resetIntervalUnit: "hours" | "days" | "weeks" | "months" | null;
    }) => {
      const response = await api.post("/checklist", payload);
      return response.data.data.checklist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });
};

export const useUpdateChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string };
    }) => {
      const response = await api.patch(`/checklist/${id}`, payload);
      return response.data.data.checklist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });
};

export const useDeleteChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/checklist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });
};
