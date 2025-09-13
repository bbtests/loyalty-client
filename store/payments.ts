import { createEntity } from "./entityFactory";

export const payments = createEntity<any>({
  reducerPath: "paymentsApi",
  entityEndpoint: "payments",
});

export const {
  useGetAllQuery: useGetPaymentsQuery,
  useGetByIdQuery: useGetPaymentQuery,
  useCreateMutation: useCreatePaymentMutation,
  useUpdateMutation: useUpdatePaymentMutation,
  useDeleteMutation: useDeletePaymentMutation,
} = payments;
