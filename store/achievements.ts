import type { Achievement } from "../types/achievement";
import { createEntity } from "./entityFactory";
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../lib/api-client";

export const achievements = createEntity<Achievement>({
  reducerPath: "achievementsApi",
  entityEndpoint: "achievements",
});

// Create a custom API for achievement-specific endpoints
export const achievementApi = createApi({
  reducerPath: "achievementApi",
  baseQuery: async ({ url, method, body }: { url: string; method?: string; body?: any }) => {
    try {
      let result: any;
      switch ((method || "POST").toUpperCase()) {
        case "POST":
          result = await apiClient.post(url, body);
          return { data: result?.data?.item || result?.data };
        default:
          return {
            error: {
              status: "METHOD_NOT_SUPPORTED",
              error: "Method not supported",
            },
          };
      }
    } catch (error: any) {
      return {
        error: {
          status: error?.code || "CUSTOM_ERROR",
          error: error?.message || "Unknown error",
        },
      };
    }
  },
  tagTypes: ["Achievement"],
  endpoints: (builder) => ({
    simulateAchievement: builder.mutation<Achievement, { achievement_id?: number }>({
      query: (body) => ({
        url: "/achievements/simulate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Achievement"],
    }),
  }),
});

export const {
  useGetAllQuery: useGetAchievementsQuery,
  useGetByIdQuery: useGetAchievementQuery,
  useCreateMutation: useCreateAchievementMutation,
  useUpdateMutation: useUpdateAchievementMutation,
  useDeleteMutation: useDeleteAchievementMutation,
} = achievements;

export const {
  useSimulateAchievementMutation,
} = achievementApi;
