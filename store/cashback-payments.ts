import type { CashbackPayment } from "../types/cashback-payment";
import { createEntity } from "./entityFactory";

export const cashbackPayments = createEntity<CashbackPayment>({
  reducerPath: "cashbackPaymentsApi",
  entityEndpoint: "cashback-payments",
});

export const {
  useGetAllQuery: useGetCashbackPaymentsQuery,
  useGetByIdQuery: useGetCashbackPaymentQuery,
  useCreateMutation: useCreateCashbackPaymentMutation,
  useUpdateMutation: useUpdateCashbackPaymentMutation,
  useDeleteMutation: useDeleteCashbackPaymentMutation,
} = cashbackPayments;
