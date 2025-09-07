import type { Achievement } from "../types/achievement";
import { createEntity } from "./entityFactory";

export const achievements = createEntity<Achievement>({
  reducerPath: "achievementsApi",
  entityEndpoint: "achievements",
});

export const {
  useGetAllQuery: useGetAchievementsQuery,
  useGetByIdQuery: useGetAchievementQuery,
  useCreateMutation: useCreateAchievementMutation,
  useUpdateMutation: useUpdateAchievementMutation,
  useDeleteMutation: useDeleteAchievementMutation,
} = achievements;
