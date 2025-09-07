import type { Badge } from "../types/badge";
import { createEntity } from "./entityFactory";

export const badges = createEntity<Badge>({
  reducerPath: "badgesApi",
  entityEndpoint: "badges",
});

export const {
  useGetAllQuery: useGetBadgesQuery,
  useGetByIdQuery: useGetBadgeQuery,
  useCreateMutation: useCreateBadgeMutation,
  useUpdateMutation: useUpdateBadgeMutation,
  useDeleteMutation: useDeleteBadgeMutation,
} = badges;
