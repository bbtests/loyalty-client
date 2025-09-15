import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "@/lib/api-client";
import type {
  LoyaltyData,
  PaymentProvidersResponse,
  PaymentProviderPublicKey,
  InitializePaymentRequest,
  InitializePaymentResponse,
  PaymentVerification,
  ProcessPurchaseAfterPaymentRequest,
  ProcessPurchaseAfterPaymentResponse,
  TransactionData,
  CashbackPaymentData,
  RedeemPointsRequest,
  RedeemPointsResponse,
  CashbackRequestRequest,
  CashbackRequestResponse,
} from "../types/api";

export const loyaltyApi = createApi({
  reducerPath: "loyaltyApi",
  baseQuery: async ({
    url,
    method,
    body,
  }: {
    url: string;
    method?: string;
    body?: any;
  }) => {
    try {
      let result: any;
      switch ((method || "GET").toUpperCase()) {
        case "GET":
          result = await apiClient.get(url);
          return { data: result };
        case "POST":
          result = await apiClient.post(url, body);
          return { data: result };
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error: any) {
      return {
        error: {
          status: error.response?.status || 500,
          error: error.message || "Unknown error",
          data: error.response?.data,
        },
      };
    }
  },
  tagTypes: [
    "LoyaltyData",
    "PaymentProviders",
    "UserTransactions",
    "UserCashbackPayments",
  ],
  endpoints: (builder) => ({
    // Get user's loyalty data including achievements and badges
    getUserLoyaltyData: builder.query<LoyaltyData, number>({
      query: (userId: number) => ({
        url: `/users/${userId}/achievements`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data.item,
      providesTags: ["LoyaltyData"],
    }),

    // Get available payment providers
    getPaymentProviders: builder.query<PaymentProvidersResponse, void>({
      query: () => ({
        url: "/payments/providers",
        method: "GET",
      }),
      transformResponse: (response: any) => response.data.item,
      providesTags: ["PaymentProviders"],
    }),

    // Get public key for a payment provider
    getPaymentProviderPublicKey: builder.query<
      PaymentProviderPublicKey,
      string
    >({
      query: (provider: string) => ({
        url: `/payments/public-key?provider=${provider}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data.item,
    }),

    // Initialize payment
    initializePayment: builder.mutation<
      InitializePaymentResponse,
      InitializePaymentRequest
    >({
      query: (paymentData) => ({
        url: "/payments/initialize",
        method: "POST",
        body: paymentData,
      }),
      transformResponse: (response: any) => response.data.item,
    }),

    // Verify payment
    verifyPayment: builder.mutation<
      PaymentVerification,
      { reference: string; provider: string }
    >({
      query: ({ reference, provider }) => ({
        url: "/payments/verify",
        method: "POST",
        body: { reference, provider },
      }),
      transformResponse: (response: any) => response.data.item,
    }),

    // Process purchase after payment verification
    processPurchaseAfterPayment: builder.mutation<
      ProcessPurchaseAfterPaymentResponse,
      ProcessPurchaseAfterPaymentRequest
    >({
      query: (purchaseData) => ({
        url: "/payments/process-purchase",
        method: "POST",
        body: purchaseData,
      }),
      transformResponse: (response: any) => response.data.item,
      invalidatesTags: ["LoyaltyData"],
    }),

    // Get user transactions
    getUserTransactions: builder.query<
      { data: TransactionData[]; pagination: any },
      { userId: number; page?: number }
    >({
      query: ({ userId, page = 1 }) => ({
        url: `/users/${userId}/transactions?page=${page}`,
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        data: response.data.items,
        pagination: response.meta.pagination,
      }),
      providesTags: ["UserTransactions"],
    }),

    // Get user cashback payments
    getUserCashbackPayments: builder.query<
      { data: CashbackPaymentData[]; pagination: any },
      number
    >({
      query: (userId: number) => ({
        url: `/users/${userId}/cashback-payments`,
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        data: response.data.items,
        pagination: response.meta.pagination,
      }),
      providesTags: ["UserCashbackPayments"],
    }),

    // Redeem loyalty points
    redeemPoints: builder.mutation<RedeemPointsResponse, RedeemPointsRequest>({
      query: (redeemData) => ({
        url: "/users/redeem-points",
        method: "POST",
        body: redeemData,
      }),
      transformResponse: (response: any) => response.data.item,
      invalidatesTags: ["LoyaltyData"],
    }),

    // Request cashback
    requestCashback: builder.mutation<
      CashbackRequestResponse,
      CashbackRequestRequest
    >({
      query: (cashbackData) => ({
        url: "/cashback/process",
        method: "POST",
        body: cashbackData,
      }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["UserCashbackPayments"],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetUserLoyaltyDataQuery,
  useGetPaymentProvidersQuery,
  useGetPaymentProviderPublicKeyQuery,
  useInitializePaymentMutation,
  useVerifyPaymentMutation,
  useProcessPurchaseAfterPaymentMutation,
  useGetUserTransactionsQuery,
  useGetUserCashbackPaymentsQuery,
  useRedeemPointsMutation,
  useRequestCashbackMutation,
} = loyaltyApi;
