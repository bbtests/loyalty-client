export interface CashbackPayment {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  payment_provider: string;
  provider_transaction_id: string;
  status: string;
  payment_details: Record<string, any>;
  created_at: string;
  updated_at: string;
}
