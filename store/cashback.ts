import { createEntity } from "./entityFactory";

export const cashback = createEntity<any>({
  reducerPath: "cashbackApi",
  entityEndpoint: "cashback",
});

export const {
  useGetAllQuery: useGetCashbackQuery,
  useGetByIdQuery: useGetCashbackByIdQuery,
  useCreateMutation: useCreateCashbackMutation,
  useUpdateMutation: useUpdateCashbackMutation,
  useDeleteMutation: useDeleteCashbackMutation,
} = cashback;
