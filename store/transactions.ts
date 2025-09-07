import type { Transaction } from "../types/transaction";
import { createEntity } from "./entityFactory";

export const transactions = createEntity<Transaction>({
  reducerPath: "transactionsApi",
  entityEndpoint: "transactions",
});

export const {
  useGetAllQuery: useGetTransactionsQuery,
  useGetByIdQuery: useGetTransactionQuery,
  useCreateMutation: useCreateTransactionMutation,
  useUpdateMutation: useUpdateTransactionMutation,
  useDeleteMutation: useDeleteTransactionMutation,
} = transactions;
