export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  points_earned: number;
  transaction_type: string;
  external_transaction_id: string;
  status: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
