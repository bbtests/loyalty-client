import { AnyAction, configureStore } from "@reduxjs/toolkit";
import { users } from "./users";
import { achievements } from "./achievements";
import { badges } from "./badges";
import { transactions } from "./transactions";
import { loyaltyPoints } from "./loyalty-points";
import { cashbackPayments } from "./cashback-payments";

const autoResetMiddleware =
  (storeAPI: any) => (next: any) => (action: AnyAction) => {
    // Check for fulfilled mutation actions
    if (action.type && action.type.endsWith("/fulfilled")) {
      // Pattern: brandsApi/executeMutation/fulfilled
      const match = action.type.match(/^(\w+)\/executeMutation\/fulfilled$/);
      if (match) {
        const [, reducerPath] = match;

        // Get the actual endpoint name from meta.arg.endpointName
        const endpointName = action.meta?.arg?.endpointName;

        if (endpointName) {
          // Check if this is a mutation that should trigger a reset
          const isMutation =
            endpointName.startsWith("create") ||
            endpointName.startsWith("update") ||
            endpointName.startsWith("delete");

          if (isMutation) {
            // Find the matching API and reset its state
            const apiEntry = Object.values(storeApis).find(
              (api: any) => api.reducerPath === reducerPath,
            );

            if (apiEntry && apiEntry.util?.resetApiState) {
              setTimeout(() => {
                storeAPI.dispatch(apiEntry.util.resetApiState());
              }, 500);
            }
          }
        }
      }
    }

    return next(action);
  };

export const store = configureStore({
  reducer: {
    [users.reducerPath]: users.reducer,
    [achievements.reducerPath]: achievements.reducer,
    [badges.reducerPath]: badges.reducer,
    [transactions.reducerPath]: transactions.reducer,
    [loyaltyPoints.reducerPath]: loyaltyPoints.reducer,
    [cashbackPayments.reducerPath]: cashbackPayments.reducer,
  } as any,
  middleware: (getDefaultMiddleware) =>
    (getDefaultMiddleware() as any).concat([
      autoResetMiddleware,
      users.middleware,
      achievements.middleware,
      badges.middleware,
      transactions.middleware,
      loyaltyPoints.middleware,
      cashbackPayments.middleware,
    ]) as any,
});

export const storeApis = {
  users,
  achievements,
  badges,
  transactions,
  loyaltyPoints,
  cashbackPayments,
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
