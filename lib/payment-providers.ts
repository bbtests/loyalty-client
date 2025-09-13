// Payment provider utilities to consolidate handling logic

export type PaymentProvider = "paystack" | "flutterwave" | "mock";

export interface PaymentProviderConfig {
  name: PaymentProvider;
  requiresRedirect: boolean;
  redirectUrlKey: "authorization_url" | "payment_url";
  supportsDirectProcessing: boolean;
}

export const PAYMENT_PROVIDERS: Record<PaymentProvider, PaymentProviderConfig> =
  {
    paystack: {
      name: "paystack",
      requiresRedirect: true,
      redirectUrlKey: "authorization_url",
      supportsDirectProcessing: false,
    },
    flutterwave: {
      name: "flutterwave",
      requiresRedirect: true,
      redirectUrlKey: "payment_url",
      supportsDirectProcessing: false,
    },
    mock: {
      name: "mock",
      requiresRedirect: false,
      redirectUrlKey: "authorization_url", // Not used for mock
      supportsDirectProcessing: true,
    },
  };

/**
 * Determines if a payment provider requires redirect-based flow
 */
export function requiresRedirect(provider: PaymentProvider): boolean {
  return PAYMENT_PROVIDERS[provider].requiresRedirect;
}

/**
 * Gets the redirect URL key for a payment provider
 */
export function getRedirectUrlKey(provider: PaymentProvider): string {
  return PAYMENT_PROVIDERS[provider].redirectUrlKey;
}

/**
 * Determines if a payment provider supports direct processing (no redirect)
 */
export function supportsDirectProcessing(provider: PaymentProvider): boolean {
  return PAYMENT_PROVIDERS[provider].supportsDirectProcessing;
}

/**
 * Handles payment provider redirect logic
 */
export function handlePaymentRedirect(
  provider: PaymentProvider,
  paymentInitResponse: any,
  extractUrlFn: (response: any) => string | undefined,
): { shouldRedirect: boolean; redirectUrl?: string } {
  if (!requiresRedirect(provider)) {
    return { shouldRedirect: false };
  }

  const redirectUrl = extractUrlFn(paymentInitResponse);

  if (redirectUrl) {
    return { shouldRedirect: true, redirectUrl };
  }

  return { shouldRedirect: false };
}

/**
 * Gets the default payment provider
 */
export function getDefaultProvider(): PaymentProvider {
  return "mock"; // Default to mock for development/testing
}

/**
 * Validates payment provider selection
 */
export function isValidProvider(provider: string): provider is PaymentProvider {
  return provider in PAYMENT_PROVIDERS;
}
