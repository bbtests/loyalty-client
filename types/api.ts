// Centralized API types to avoid duplication

export interface ApiResponse<T> {
  status: "success" | "error";
  code: number;
  message: string;
  data: T;
  errors: Array<{
    field: string;
    message: string;
  }>;
  meta: {
    pagination?: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
  };
}

// User and Authentication Types
export interface User {
  id: number;
  name: string;
  email: string;
  roles?: Array<{
    id: number;
    name: string;
  }>;
}

// Loyalty System Types
export interface LoyaltyData {
  user_id: number;
  points: {
    available: number;
    total_earned: number;
    total_redeemed: number;
  };
  achievements: Achievement[];
  badges: Badge[];
  current_badge: CurrentBadge | null;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  badge_icon: string; // Changed from 'icon' to match component expectations
  unlocked_at: string;
  progress?: number;
  target?: number;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  tier: number; // Changed to number to match component expectations
}

export interface CurrentBadge {
  id: number;
  name: string;
  tier: number;
  icon: string;
}

// Payment System Types
export interface PaymentProvider {
  name: string;
  available: boolean;
  supported_currencies: string[];
  minimum_amount: number;
  maximum_amount: number;
}

export interface PaymentProvidersResponse {
  [key: string]: PaymentProvider;
}

export interface PaymentProviderPublicKey {
  public_key: string;
  provider: string;
}

export interface InitializePaymentRequest {
  amount: number;
  description: string;
  provider: string;
}

export interface InitializePaymentResponse {
  reference?: string;
  payment_url?: string;
  amount: number;
  provider: string;
  // For mock provider response structure
  success?: boolean;
  data?: {
    reference: string;
    authorization_url?: string;
    payment_url?: string;
    access_code?: string;
    transaction_id?: string;
  };
}

export interface PaymentVerification {
  status?: string;
  transaction_id?: string;
  amount?: number;
  reference?: string;
  // For mock provider response structure
  success?: boolean;
  data?: {
    status: string;
    transaction_id: string;
    amount: number;
    reference: string;
  };
}

export interface ProcessPaymentRequest {
  amount: number;
  currency: string;
  provider: string;
  description?: string;
}

export interface ProcessPurchaseAfterPaymentRequest {
  user_id: number;
  amount: number;
  transaction_id: string;
}

export interface ProcessPurchaseAfterPaymentResponse {
  id: number;
  amount: string;
  points_earned: number;
  transaction_type: string;
  status: string;
  created_at: string;
}

export interface TransactionData {
  id: number;
  user_id: number;
  amount: string;
  points_earned: number;
  transaction_type: string;
  external_transaction_id: string | null;
  status: string;
  created_at: string;
  metadata: {
    points_rate: number;
    processed_at: string;
  };
}

export interface CashbackPaymentData {
  id: number;
  user_id: number;
  transaction_id: number | null;
  amount: string;
  payment_provider: string;
  provider_transaction_id: string | null;
  status: string;
  payment_details: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// Redeem Points Types
export interface RedeemPointsRequest {
  points: number;
}

export interface RedeemPointsResponse {
  user_id: number;
  points: {
    available: number;
    total_earned: number;
    total_redeemed: number;
  };
  achievements: Achievement[];
  badges: Badge[];
}

// Cashback Request Types
export interface CashbackRequestRequest {
  amount: number;
  transaction_id?: number;
}

export interface CashbackRequestResponse {
  status: "success" | "error";
  code: number;
  message: string;
  data: {
    item: {
      amount: number;
      status: string;
      estimated_processing_time: string;
      transaction_id?: number;
    } | null;
  };
  errors: Array<{
    field: string;
    message: string;
  }>;
  meta: {
    pagination: null;
  };
}
