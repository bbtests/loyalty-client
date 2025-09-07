import type { LoyaltyPoint } from "../types/loyalty-point";
import { createEntity } from "./entityFactory";

export const loyaltyPoints = createEntity<LoyaltyPoint>({
  reducerPath: "loyaltyPointsApi",
  entityEndpoint: "loyalty-points",
});

export const {
  useGetAllQuery: useGetLoyaltyPointsQuery,
  useGetByIdQuery: useGetLoyaltyPointQuery,
  useCreateMutation: useCreateLoyaltyPointMutation,
  useUpdateMutation: useUpdateLoyaltyPointMutation,
  useDeleteMutation: useDeleteLoyaltyPointMutation,
} = loyaltyPoints;
