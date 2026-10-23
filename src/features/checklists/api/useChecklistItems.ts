// src/features/checklists/api/useChecklistItems.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { ChecklistItem, ChecklistItemEntry, ChecklistItemType } from "../types";

export const useChecklistItems = (checklistId: string) => {
  return useQuery({
    queryKey: ["checklistItems", checklistId],
    queryFn: async () => {
      const response = await api.get(`/checklist/${checklistId}/item`);
      return response.data.data.checklistItems as ChecklistItem[];
    },
    enabled: !!checklistId,
  });
};

/** Payload for PATCH /checklist/item/:id/entry - the fields depend on the item type. */
export type EntryUpdate =
  | { completed: boolean }
  | { addedAmount: number }
  | { current: number }
  | { durationSeconds: number }
  | { selectedRangeNumber: number }
  | { selectedCategory: string };

export const useUpdateItemEntry = (checklistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: EntryUpdate;
    }) => {
      const response = await api.patch(`/checklist/item/${itemId}/entry`, payload);
      return response.data;
    },

    onMutate: async ({ itemId, payload }) => {
      await queryClient.cancelQueries({
        queryKey: ["checklistItems", checklistId],
      });

      const previousItems = queryClient.getQueryData<ChecklistItem[]>([
        "checklistItems",
        checklistId,
      ]);

      if (previousItems) {
        queryClient.setQueryData<ChecklistItem[]>(
          ["checklistItems", checklistId],
          (old) => {
            if (!old) return old;

            return old.map((item) => {
              if (item.id !== itemId) return item;

              const clonedEntries: ChecklistItemEntry[] =
                item.entries && item.entries.length > 0
                  ? [{ ...item.entries[0] }]
                  : [{ id: "temp", timeframeKey: "temp" }];

              if ("completed" in payload) {
                clonedEntries[0].completed = payload.completed;
              }
              if ("addedAmount" in payload) {
                clonedEntries[0].current =
                  (clonedEntries[0].current || 0) + payload.addedAmount;
              }

              return { ...item, entries: clonedEntries };
            });
          },
        );
      }

      return { previousItems };
    },

    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          ["checklistItems", checklistId],
          context.previousItems,
        );
      }
      alert("Network error: Couldn't save update. Reverting change.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["checklistItems", checklistId],
      });
    },
  });
};

export const useCreateItem = (checklistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      type: ChecklistItemType;
      settings: any;
      customInterval?: { value: number; unit: string };
    }) => {
      const response = await api.post(
        `/checklist/${checklistId}/item`,
        payload,
      );
      return response.data.data.checklistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checklistItems", checklistId],
      });
    },
  });
};

export const useUpdateItem = (checklistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: { name: string };
    }) => {
      const response = await api.patch(`/checklist/item/${itemId}`, payload);
      return response.data.data.checklistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checklistItems", checklistId],
      });
    },
  });
};

export const useDeleteItem = (checklistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/checklist/item/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checklistItems", checklistId],
      });
    },
  });
};
