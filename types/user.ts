import Role from "./role";

export interface Achievement {
  id: number;
  name: string;
  description: string;
  badge_icon: string;
  unlocked_at: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  tier: number;
  icon: string;
  earned_at: string;
}

export interface LoyaltyPoints {
  id: number;
  points: number;
  total_earned: number;
  total_redeemed: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  achievements?: Achievement[];
  badges?: Badge[];
  loyalty_points?: LoyaltyPoints;
}
