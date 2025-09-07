export interface Badge {
  id: string;
  name: string;
  description: string;
  requirements: Record<string, any>;
  icon: string;
  tier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
